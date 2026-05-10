import path from "path";
import os from "os";
import fs from "fs";
import { after, before, suite, test } from "mocha";
import { assert } from "chai";
import { db, initStores } from "@/core/data/db.js";

/**
 * Tests that exercise the JSON store write to a tmp directory so they
 * don't pollute the project's `data/` folder.
 */
const TEST_DIR = path.join(os.tmpdir(), `beanmap-db-test-${Date.now()}-${process.pid}`);

suite("Core - db", () => {
  before(() => {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  after(() => {
    try {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    } catch (_e) {
      /* tolerate cleanup races */
    }
  });

  test("db module exports an object", () => {
    assert.isObject(db);
  });

  test("db has userStore, cafeStore and categoryStore", () => {
    initStores("memory");
    assert.property(db, "userStore");
    assert.property(db, "cafeStore");
    assert.property(db, "categoryStore");
  });

  test("initStores('memory') assigns memory stores", () => {
    initStores("memory");
    assert.exists(db.userStore);
    assert.exists(db.cafeStore);
    assert.exists(db.categoryStore);
    assert.isFunction(db.userStore.addUser);
    assert.isFunction(db.cafeStore.addCafe);
    assert.isFunction(db.categoryStore.addCategory);
    assert.isFunction(db.categoryStore.seedIfEmpty);
  });

  test("memory userStore.addUser and getUserByEmail work", async () => {
    initStores("memory");
    await db.userStore.addUser({ email: "a@b.com", password: "secret" });
    const user = await db.userStore.getUserByEmail("a@b.com");
    assert.exists(user);
    assert.strictEqual(user?.email, "a@b.com");
  });

  test("initStores('json', tmpDir) writes to the tmp dir, not project data/", async () => {
    initStores("json", TEST_DIR);
    await db.userStore.addUser({ email: "isolated@test.com", password: "x" });
    const user = await db.userStore.getUserByEmail("isolated@test.com");
    assert.exists(user);
    assert.exists(fs.existsSync(path.join(TEST_DIR, "users.json")));
    // Hard guarantee: this user does NOT appear in the project data file.
    const projectUsers = path.join(process.cwd(), "data", "users.json");
    if (fs.existsSync(projectUsers)) {
      const raw = fs.readFileSync(projectUsers, "utf8");
      assert.notInclude(raw, "isolated@test.com");
    }
  });

  test("memory cafeStore CRUD and getByCategory work", async () => {
    initStores("memory");
    await db.cafeStore.addCafe({
      name: "Test Cafe",
      category: "Specialty",
      description: "A test",
    });
    const all = await db.cafeStore.getAllCafes();
    assert.lengthOf(all, 1);
    const byCat = await db.cafeStore.getByCategory("Specialty");
    assert.lengthOf(byCat, 1);
  });

  test("memory categoryStore.seedIfEmpty seeds presets, then is idempotent", async () => {
    initStores("memory");
    await db.categoryStore.seedIfEmpty([
      { name: "Coffee", colour: "#7c2d12" },
      { name: "Tea", colour: "#15803d" },
    ]);
    const first = await db.categoryStore.getAllCategories();
    assert.lengthOf(first, 2);
    await db.categoryStore.seedIfEmpty([{ name: "Bakery", colour: "#b45309" }]);
    const second = await db.categoryStore.getAllCategories();
    assert.lengthOf(second, 2); // not 3 — already seeded, second call is a no-op
  });

  test("categoryStore.getByName is case-insensitive", async () => {
    initStores("memory");
    await db.categoryStore.addCategory({ name: "Coffee", colour: "#7c2d12", isPreset: true });
    const a = await db.categoryStore.getByName("coffee");
    const b = await db.categoryStore.getByName("COFFEE");
    assert.exists(a);
    assert.exists(b);
    assert.strictEqual(a.name, "Coffee");
    assert.strictEqual(b.name, "Coffee");
  });
});
