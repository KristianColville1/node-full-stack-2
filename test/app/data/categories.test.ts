import { suite, test } from "mocha";
import { assert } from "chai";
import {
  PRESET_CATEGORIES,
  DEFAULT_CATEGORY_COLOUR,
  PICKER_COLOUR,
  buildCategoryIndex,
  resolveCategoryStyle,
} from "@/app/data/categories.js";

suite("Categories — palette + resolver", () => {
  test("every preset has a non-empty name and a 7-char hex colour", () => {
    assert.isAbove(PRESET_CATEGORIES.length, 0);
    for (const p of PRESET_CATEGORIES) {
      assert.isString(p.name);
      assert.isAbove(p.name.length, 0);
      assert.match(p.colour, /^#[0-9a-f]{6}$/i);
    }
  });

  test("PRESET_CATEGORIES has unique names", () => {
    const names = PRESET_CATEGORIES.map((c) => c.name.toLowerCase());
    const unique = new Set(names);
    assert.strictEqual(names.length, unique.size, "preset names must be unique");
  });

  test("DEFAULT_CATEGORY_COLOUR and PICKER_COLOUR are valid hex strings", () => {
    assert.match(DEFAULT_CATEGORY_COLOUR, /^#[0-9a-f]{6}$/i);
    assert.match(PICKER_COLOUR, /^#[0-9a-f]{6}$/i);
  });

  test("buildCategoryIndex returns a Map keyed by lower-cased name", () => {
    const idx = buildCategoryIndex([
      { name: "Coffee", colour: "#7c2d12", isPreset: true },
      { name: "Tea", colour: "#15803d", isPreset: true },
    ]);
    assert.instanceOf(idx, Map);
    assert.exists(idx.get("coffee"));
    assert.exists(idx.get("tea"));
    assert.notExists(idx.get("bakery"));
  });

  test("resolveCategoryStyle returns the canonical-cased name when matched", () => {
    // Simulate the post-seed state: store records carry isPreset.
    const seeded = PRESET_CATEGORIES.map((p) => ({ ...p, isPreset: true }));
    const idx = buildCategoryIndex(seeded);
    for (const variant of ["coffee", "Coffee", "COFFEE", "CoFfEe"]) {
      const style = resolveCategoryStyle(variant, idx);
      assert.strictEqual(style.name, "Coffee");
      assert.strictEqual(style.isPreset, true);
      assert.strictEqual(style.isKnown, true);
      assert.match(style.colour, /^#[0-9a-f]{6}$/i);
    }
  });

  test("resolveCategoryStyle returns default-slate for unknown categories", () => {
    const seeded = PRESET_CATEGORIES.map((p) => ({ ...p, isPreset: true }));
    const idx = buildCategoryIndex(seeded);
    const style = resolveCategoryStyle("Vegan Bakery", idx);
    assert.strictEqual(style.name, "Vegan Bakery");
    assert.strictEqual(style.colour, DEFAULT_CATEGORY_COLOUR);
    assert.strictEqual(style.isPreset, false);
    assert.strictEqual(style.isKnown, false);
  });

  test("resolveCategoryStyle handles empty / null / undefined name", () => {
    const seeded = PRESET_CATEGORIES.map((p) => ({ ...p, isPreset: true }));
    const idx = buildCategoryIndex(seeded);
    for (const v of ["", null, undefined]) {
      const style = resolveCategoryStyle(v as any, idx);
      assert.strictEqual(style.colour, DEFAULT_CATEGORY_COLOUR);
      assert.strictEqual(style.isKnown, false);
    }
  });

  test("resolveCategoryStyle treats a missing index as 'unknown' for all inputs", () => {
    const style = resolveCategoryStyle("Coffee", new Map());
    assert.strictEqual(style.colour, DEFAULT_CATEGORY_COLOUR);
    assert.strictEqual(style.isKnown, false);
  });
});
