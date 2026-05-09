import { db } from "@/core/data/db.js";
import { validationError } from "@/app/api/logger.js";
import { CafeSpec, CafeUpdateSpec } from "@/app/data/schema/joi-schemas.js";

/** Cafe API: CRUD and getByCategory. JSON only. */
export const cafeApi = {
  /** GET /api/cafes — List all cafes. */
  list: {
    handler: async function (request, h) {
      const cafes = await db.cafeStore.getAllCafes();
      return h.response(cafes).code(200);
    },
  },
  /** GET /api/cafes/{id} — One cafe; 404 if missing. */
  getOne: {
    handler: async function (request, h) {
      const { id } = request.params;
      const cafe = await db.cafeStore.getCafeById(id);
      if (!cafe) return h.response({ error: "Not found" }).code(404);
      return h.response(cafe).code(200);
    },
  },
  /** POST /api/cafes — Create cafe, return created (201). */
  create: {
    validate: {
      payload: CafeSpec,
      options: { abortEarly: false },
      failAction: (request, h, err) => validationError(request, h, err),
    },
    handler: async function (request, h) {
      const cafe = request.payload as { name: string; category: string; description?: string; latitude: number; longitude: number };
      const created = await db.cafeStore.addCafe(cafe);
      if (created) return h.response(created).code(201);
      return h.response({ error: "Failed to create cafe" }).code(500);
    },
  },
  /** PUT /api/cafes/{id} — Update cafe; 404 if missing. */
  update: {
    validate: {
      payload: CafeUpdateSpec,
      options: { abortEarly: false },
      failAction: (request, h, err) => validationError(request, h, err),
    },
    handler: async function (request, h) {
      const { id } = request.params;
      const payload = request.payload as { name?: string; category?: string; description?: string; latitude?: number; longitude?: number; analytics?: { views?: number }; userId?: string };
      const existing = await db.cafeStore.getCafeById(id);
      if (!existing) return h.response({ error: "Not found" }).code(404);
      await db.cafeStore.updateCafe(id, {
        ...payload,
        description: payload.description !== undefined ? payload.description : existing.description,
      });
      const updated = await db.cafeStore.getCafeById(id);
      return h.response(updated).code(200);
    },
  },
  /** DELETE /api/cafes/{id} — Remove cafe; 404 if missing, 204 on success. */
  remove: {
    handler: async function (request, h) {
      const { id } = request.params;
      const existing = await db.cafeStore.getCafeById(id);
      if (!existing) return h.response({ error: "Not found" }).code(404);
      await db.cafeStore.deleteCafe(id);
      return h.response().code(204);
    },
  },
  /** GET /api/cafes/category/{category} — Cafes in category. */
  getByCategory: {
    handler: async function (request, h) {
      const { category } = request.params;
      const cafes = await db.cafeStore.getByCategory(category);
      return h.response(cafes).code(200);
    },
  },
};
