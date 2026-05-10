import { v4 as uuidv4 } from "uuid";
import { initStore } from "@/core/data/store-utils.js";

/**
 * Cafe store backed by a JSON file in the project-root data directory.
 */
export function createJsonCafeStore() {
  const db = initStore("cafes");

  return {
    async addCafe(cafe) {
      await db.read();
      const record = { ...cafe, _id: uuidv4() };
      db.data.cafes.push(record);
      await db.write();
      return record;
    },

    async getCafeById(id) {
      await db.read();
      return db.data.cafes.find((c) => c._id === id) ?? null;
    },

    async getAllCafes() {
      await db.read();
      return [...db.data.cafes];
    },

    async updateCafe(id, cafe) {
      await db.read();
      const i = db.data.cafes.findIndex((c) => c._id === id);
      if (i === -1) return;
      db.data.cafes[i] = { ...db.data.cafes[i], ...cafe };
      await db.write();
    },

    async deleteCafe(id) {
      await db.read();
      db.data.cafes = db.data.cafes.filter((c) => c._id !== id);
      await db.write();
    },

    async getByCategory(category) {
      await db.read();
      const key = category.toLowerCase();
      return db.data.cafes.filter((c) => c.category?.toLowerCase() === key);
    },

    async deleteByUserId(userId) {
      await db.read();
      db.data.cafes = db.data.cafes.filter((c) => c.userId !== userId);
      await db.write();
    },
  };
}
