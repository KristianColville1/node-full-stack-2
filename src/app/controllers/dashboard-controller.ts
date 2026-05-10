import { db } from "@/core/data/db.js";
import { buildCategoryIndex, resolveCategoryStyle } from "@/app/data/categories.js";

function buildChipData(cafes, allCategories, activeName) {
  const counts = {};
  const colours = {};
  const idx = buildCategoryIndex(allCategories);
  for (const c of cafes) {
    if (!c.category) continue;
    const style = resolveCategoryStyle(c.category, idx);
    counts[style.name] = (counts[style.name] || 0) + 1;
    colours[style.name] = style.colour;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => ({
      name,
      count,
      colour: colours[name],
      isActive: name === activeName,
    }));
}

function decorateCafes(cafes, allCategories, userId) {
  const idx = buildCategoryIndex(allCategories);
  return cafes.map((c) => {
    const style = resolveCategoryStyle(c.category, idx);
    return {
      ...c,
      categoryColour: style.colour,
      canDelete: !!(userId && c.userId && c.userId === userId),
    };
  });
}

function buildMapData(cafes, allCategories) {
  const idx = buildCategoryIndex(allCategories);
  return cafes
    .filter((c) => typeof c.latitude === "number" && typeof c.longitude === "number")
    .map((c) => {
      const style = resolveCategoryStyle(c.category, idx);
      return {
        id: c._id,
        name: c.name,
        latitude: c.latitude,
        longitude: c.longitude,
        category: style.name,
        categoryColour: style.colour,
        viewCount: c.analytics?.views ?? 0,
        imageUrl: c.imageUrl ?? null,
      };
    });
}

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const cafes = await db.cafeStore.getAllCafes();
      const allCategories = (await db.categoryStore?.getAllCategories?.()) ?? [];
      return h.view("dashboard-view", {
        title: "Dashboard",
        active: "dashboard",
        cafes: decorateCafes(cafes, allCategories, loggedInUser?._id),
        categories: buildChipData(cafes, allCategories, null),
        totalCount: cafes.length,
        activeCategory: null,
        user: loggedInUser,
        showCafeDelete: false,
        // map context
        mapMode: "picker",
        mapShowHint: true,
        cafeMapData: buildMapData(cafes, allCategories),
        // form datalist source — presets first, customs after
        presetCategories: allCategories.filter((c) => c.isPreset),
        allCategories,
      });
    },
  },
};
