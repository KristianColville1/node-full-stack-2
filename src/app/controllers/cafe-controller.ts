import { db } from "@/core/data/db.js";
import { CafeSpec } from "@/app/data/schema/joi-schemas.js";

/**
 * Build the chip data for the category-filter row: one entry per distinct
 * category present in the data, with a count and a flag marking which is active.
 * Drives the {{> category-chips}} partial.
 */
function buildCategoryChips(allCafes, activeCategory) {
  const counts = {};
  for (const c of allCafes) {
    if (!c.category) continue;
    counts[c.category] = (counts[c.category] || 0) + 1;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => ({ name, count, isActive: name === activeCategory }));
}

function decorateWithDelete(cafes, userId) {
  return cafes.map((c) => ({
    ...c,
    canDelete: !!(userId && c.userId && c.userId === userId),
  }));
}

export const cafeController = {
  /** GET /cafes — List all cafes; sets canDelete for owner on each card. */
  index: {
    handler: async function (request, h) {
      const cafes = await db.cafeStore.getAllCafes();
      const user = request.auth.credentials;
      return h.view("cafe-view", {
        title: "Cafes",
        cafes: decorateWithDelete(cafes, user?._id),
        categories: buildCategoryChips(cafes, null),
        totalCount: cafes.length,
        activeCategory: null,
        active: "cafes",
        user,
        showCafeDelete: true,
      });
    },
  },

  /** GET /cafes/category/{category} — List cafes in one category; chips reflect active. */
  byCategory: {
    handler: async function (request, h) {
      const { category } = request.params;
      const allCafes = await db.cafeStore.getAllCafes();
      const filtered = await db.cafeStore.getByCategory(category);
      const user = request.auth.credentials;
      return h.view("cafe-view", {
        title: `Cafes — ${category}`,
        cafes: decorateWithDelete(filtered, user?._id),
        categories: buildCategoryChips(allCafes, category),
        totalCount: allCafes.length,
        activeCategory: category,
        active: "cafes",
        user,
        showCafeDelete: true,
      });
    },
  },

  /** POST /cafes — Create cafe (validated). Redirects to /dashboard; owner stored as userId. */
  addCafe: {
    validate: {
      payload: CafeSpec,
      options: { abortEarly: false },
      failAction: async function (request, h, error) {
        const cafes = await db.cafeStore.getAllCafes();
        const user = request.auth?.credentials ?? null;
        return h
          .view("dashboard-view", {
            title: "Add cafe error",
            active: "dashboard",
            cafes,
            errors: error.details,
            user,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      const user = request.auth.credentials;
      const newCafe = {
        name: request.payload.name,
        category: request.payload.category,
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
      const user = request.auth.credentials;
      const canDelete = !!(user?._id && updated.userId && updated.userId === user._id);
      return h.view("cafe-detail-view", { title: updated.name, active: "cafes", user, cafe: updated, canDelete });
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
