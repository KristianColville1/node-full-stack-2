import { db } from "@/core/data/db.js";

function buildCategoryChips(allCafes) {
  const counts = {};
  for (const c of allCafes) {
    if (!c.category) continue;
    counts[c.category] = (counts[c.category] || 0) + 1;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => ({ name, count, isActive: false }));
}

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const cafes = await db.cafeStore.getAllCafes();
      return h.view("dashboard-view", {
        title: "Dashboard",
        active: "dashboard",
        cafes,
        categories: buildCategoryChips(cafes),
        totalCount: cafes.length,
        activeCategory: null,
        user: loggedInUser,
        showCafeDelete: false,
      });
    },
  },
};
