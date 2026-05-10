import { db } from "@/core/data/db.js";
import { CafeSpec } from "@/app/data/schema/joi-schemas.js";
import {
  buildCategoryIndex,
  resolveCategoryStyle,
  DEFAULT_CATEGORY_COLOUR,
} from "@/app/data/categories.js";

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

/**
 * Resolve a user-typed category to its store record, creating a custom entry
 * (default colour) on the fly if it's not already known. Returns the canonical
 * record so cafes always reference a stored category by its canonical name.
 */
async function ensureCategory(userTyped) {
  const trimmed = String(userTyped ?? "").trim();
  if (!trimmed) return { name: "", colour: DEFAULT_CATEGORY_COLOUR, isPreset: false };
  const existing = await db.categoryStore?.getByName?.(trimmed);
  if (existing) return existing;
  return db.categoryStore?.addCategory?.({
    name: trimmed,
    colour: DEFAULT_CATEGORY_COLOUR,
    isPreset: false,
  }) ?? { name: trimmed, colour: DEFAULT_CATEGORY_COLOUR, isPreset: false };
}

export const cafeController = {
  /** GET /cafes — List all cafes; sets canDelete for owner on each card. */
  index: {
    handler: async function (request, h) {
      const cafes = await db.cafeStore.getAllCafes();
      const allCategories = (await db.categoryStore?.getAllCategories?.()) ?? [];
      const user = request.auth.credentials;
      return h.view("cafe-view", {
        title: "Cafes",
        cafes: decorateCafes(cafes, allCategories, user?._id),
        categories: buildChipData(cafes, allCategories, null),
        totalCount: cafes.length,
        activeCategory: null,
        active: "cafes",
        user,
        showCafeDelete: true,
        allCategories,
      });
    },
  },

  /** GET /cafes/category/{category} — List cafes in one category; chips reflect active. */
  byCategory: {
    handler: async function (request, h) {
      const { category } = request.params;
      const allCafes = await db.cafeStore.getAllCafes();
      const filtered = await db.cafeStore.getByCategory(category);
      const allCategories = (await db.categoryStore?.getAllCategories?.()) ?? [];
      const idx = buildCategoryIndex(allCategories);
      const activeName = resolveCategoryStyle(category, idx).name;
      const user = request.auth.credentials;
      return h.view("cafe-view", {
        title: `Cafes — ${activeName}`,
        cafes: decorateCafes(filtered, allCategories, user?._id),
        categories: buildChipData(allCafes, allCategories, activeName),
        totalCount: allCafes.length,
        activeCategory: activeName,
        active: "cafes",
        user,
        showCafeDelete: true,
        allCategories,
      });
    },
  },

  /** POST /cafes — Create cafe (validated). Redirects to /dashboard; owner stored as userId.
   *  Category is normalised against the store; new categories get auto-created. */
  addCafe: {
    validate: {
      payload: CafeSpec,
      options: { abortEarly: false },
      failAction: async function (request, h, error) {
        const cafes = await db.cafeStore.getAllCafes();
        const allCategories = (await db.categoryStore?.getAllCategories?.()) ?? [];
        const user = request.auth?.credentials ?? null;
        return h
          .view("dashboard-view", {
            title: "Add cafe error",
            active: "dashboard",
            cafes: decorateCafes(cafes, allCategories, user?._id),
            categories: buildChipData(cafes, allCategories, null),
            totalCount: cafes.length,
            activeCategory: null,
            errors: error.details,
            user,
            mapMode: "picker",
            mapShowHint: true,
            cafeMapData: buildMapData(cafes, allCategories),
            presetCategories: allCategories.filter((c) => c.isPreset),
            allCategories,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      const user = request.auth.credentials;
      const cat = await ensureCategory(request.payload.category);
      const newCafe = {
        name: request.payload.name,
        category: cat.name,
        description: request.payload.description || "",
        latitude: Number(request.payload.latitude),
        longitude: Number(request.payload.longitude),
        userId: user._id,
      };
      await db.cafeStore.addCafe(newCafe);
      return h.redirect("/dashboard");
    },
  },

  /** GET /cafes/:id — Cafe detail page. Increments view counter on each hit. */
  showCafe: {
    handler: async function (request, h) {
      const { id } = request.params;
      const cafe = await db.cafeStore.getCafeById(id);
      if (!cafe) {
        return h.redirect("/cafes");
      }
      const currentViews = cafe.analytics?.views ?? 0;
      await db.cafeStore.updateCafe(id, { analytics: { views: currentViews + 1 } });
      const updated = await db.cafeStore.getCafeById(id);
      const allCategories = (await db.categoryStore?.getAllCategories?.()) ?? [];
      const idx = buildCategoryIndex(allCategories);
      const style = resolveCategoryStyle(updated.category, idx);
      const user = request.auth.credentials;
      const canDelete = !!(user?._id && updated.userId && updated.userId === user._id);
      return h.view("cafe-detail-view", {
        title: updated.name,
        active: "cafes",
        user,
        cafe: { ...updated, categoryColour: style.colour },
        canDelete,
        // map
        mapMode: "detail",
        mapShowHint: false,
        cafeMapData: buildMapData([updated], allCategories),
      });
    },
  },

  /** POST /cafes/:id/delete — Delete cafe; only allowed if current user is owner. Redirects to /cafes. */
  deleteCafe: {
    handler: async function (request, h) {
      const { id } = request.params;
      const cafe = await db.cafeStore.getCafeById(id);
      const user = request.auth.credentials;
      if (!cafe) {
        return h.redirect("/cafes");
      }
      if (!cafe.userId || cafe.userId !== user._id) {
        return h.redirect("/cafes");
      }
      await db.cafeStore.deleteCafe(id);
      return h.redirect("/cafes");
    },
  },
};
