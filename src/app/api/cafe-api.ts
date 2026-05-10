import { db } from "@/core/data/db.js";
import { validationError } from "@/app/api/logger.js";
import {
  CafeSpec,
  CafeUpdateSpec,
  CafeResponseSpec,
  CafeListResponseSpec,
  ErrorResponseSpec,
} from "@/app/data/schema/joi-schemas.js";

const swaggerOk = (schema: any) => ({
  "hapi-swagger": {
    responses: {
      "200": { description: "Success", schema },
      "404": { description: "Not found", schema: ErrorResponseSpec },
      "500": { description: "Server error", schema: ErrorResponseSpec },
    },
  },
});

/** Cafe API: CRUD and getByCategory. JSON only. */
export const cafeApi = {
  /** GET /api/cafes — List all cafes. */
  list: {
    auth: "jwt",
    tags: ["api", "cafes"],
    description: "List all cafes",
    notes: "Returns every cafe in the store.",
    plugins: swaggerOk(CafeListResponseSpec),
    handler: async function (request, h) {
      const cafes = await db.cafeStore.getAllCafes();
      return h.response(cafes).code(200);
    },
  },
  /** GET /api/cafes/{id} — One cafe; 404 if missing. */
  getOne: {
    auth: "jwt",
    tags: ["api", "cafes"],
    description: "Get one cafe",
    notes: "Returns the cafe by id, or 404 if no cafe with that id exists.",
    plugins: swaggerOk(CafeResponseSpec),
    handler: async function (request, h) {
      const { id } = request.params;
      const cafe = await db.cafeStore.getCafeById(id);
      if (!cafe) return h.response({ error: "Not found" }).code(404);
      return h.response(cafe).code(200);
    },
  },
  /** POST /api/cafes — Create cafe, return created (201). */
  create: {
    auth: "jwt",
    tags: ["api", "cafes"],
    description: "Create a cafe",
    notes: "Creates a new cafe and returns the created entity (201).",
    plugins: {
      "hapi-swagger": {
        responses: {
          "201": { description: "Created", schema: CafeResponseSpec },
          "400": { description: "Validation error", schema: ErrorResponseSpec },
          "500": { description: "Server error", schema: ErrorResponseSpec },
        },
      },
    },
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
    auth: "jwt",
    tags: ["api", "cafes"],
    description: "Update a cafe",
    notes: "Partially updates a cafe by id. Returns the updated entity, or 404 if missing.",
    plugins: swaggerOk(CafeResponseSpec),
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
    auth: "jwt",
    tags: ["api", "cafes"],
    description: "Delete a cafe",
    notes: "Removes a cafe by id. Returns 204 on success, 404 if missing.",
    plugins: {
      "hapi-swagger": {
        responses: {
          "204": { description: "Deleted" },
          "404": { description: "Not found", schema: ErrorResponseSpec },
        },
      },
    },
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
    auth: "jwt",
    tags: ["api", "cafes"],
    description: "List cafes in a category",
    notes: "Returns every cafe whose category matches (case-insensitive).",
    plugins: swaggerOk(CafeListResponseSpec),
    handler: async function (request, h) {
      const { category } = request.params;
      const cafes = await db.cafeStore.getByCategory(category);
      return h.response(cafes).code(200);
    },
  },
};
