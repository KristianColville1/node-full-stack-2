import { db } from "@/core/data/db.js";
import { CafeSpec } from "@/app/data/schema/joi-schemas.js";

export const cafeController = {
  /** GET /cafes — List all cafes; sets canDelete for owner on each card. */
  index: {
    handler: async function (request, h) {
      const cafes = await db.cafeStore.getAllCafes();
      const user = request.auth.credentials;
      const userId = user?._id;
      const cafesWithDelete = cafes.map((c) => ({
        ...c,
        canDelete: !!(userId && c.userId && c.userId === userId),
      }));
      return h.view("cafe-view", { title: "Cafes", cafes: cafesWithDelete, active: "cafes", user, showCafeDelete: true });
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
