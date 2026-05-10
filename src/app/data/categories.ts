/**
 * Category seed + helpers.
 *
 * The category store (db.categoryStore) is the runtime source of truth.
 * PRESET_CATEGORIES is the *seed* — used once at boot when the store is empty.
 * After seeding, presets and any user-added categories live side by side in
 * the store; user-added ones get DEFAULT_CATEGORY_COLOUR until an admin can
 * edit them.
 *
 * Palette spans the colour wheel (rather than huddling in the warm-brown
 * family) so markers stay distinguishable at 24x32 px on a light tile
 * background. Every preset has enough luminance contrast to hold white chip
 * text (>= 4:1 with #fff).
 *
 * No new TypeScript types — JS-style exports, mirroring the existing pattern.
 */

export const PRESET_CATEGORIES = [
  { name: "Coffee", colour: "#7c2d12" }, // rich espresso (red-brown)
  { name: "Tea", colour: "#15803d" }, // leafy green
  { name: "Bakery", colour: "#b45309" }, // toasted amber
  { name: "Brunch", colour: "#a16207" }, // golden mustard
  { name: "Dessert", colour: "#be185d" }, // berry pink
  { name: "Roastery", colour: "#1c1917" }, // dark charcoal (deepest roast)
];

export const DEFAULT_CATEGORY_COLOUR = "#6b7280"; // slate — used for user-added customs
export const PICKER_COLOUR = "#facc15"; // bright sunlit gold — temporary picker bean

/**
 * Build a quick { lowercased-name -> record } map from a categories array.
 * Used by controllers to resolve cafe.category to its colour without an
 * extra round-trip per cafe.
 */
export function buildCategoryIndex(categories) {
  const idx = new Map();
  if (!categories) return idx;
  for (const c of categories) {
    if (c && c.name) idx.set(c.name.toLowerCase(), c);
  }
  return idx;
}

/**
 * Resolve styling for a category name against a fetched category index.
 * Returns the canonical-cased name when the input matches a stored category
 * (case-insensitive); otherwise returns the user-typed name unchanged with the
 * default slate colour.
 */
export function resolveCategoryStyle(name, index) {
  if (!name) {
    return { name: "", colour: DEFAULT_CATEGORY_COLOUR, isPreset: false, isKnown: false };
  }
  const found = index?.get(String(name).toLowerCase());
  if (found) {
    return {
      name: found.name,
      colour: found.colour,
      isPreset: !!found.isPreset,
      isKnown: true,
    };
  }
  return {
    name: String(name),
    colour: DEFAULT_CATEGORY_COLOUR,
    isPreset: false,
    isKnown: false,
  };
}
