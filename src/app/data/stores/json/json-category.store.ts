import { v4 as uuidv4 } from "uuid";
import { initStore } from "@/core/data/store-utils.js";

/**
 * Category store backed by a JSON file in the project-root data directory.
 * `baseDir` lets tests redirect writes to a temp directory.
 */
export function createJsonCategoryStore(baseDir) {
  const db = initStore("categories", baseDir);

  return {
    async addCategory(category) {
      await db.read();
      const record = {
        _id: uuidv4(),
        name: category.name,
        colour: category.colour,
        isPreset: !!category.isPreset,
      };
      db.data.categories.push(record);
      await db.write();
      return record;
    },

    async getByName(name) {
      if (!name) return null;
      await db.read();
      const key = String(name).toLowerCase();
      return db.data.categories.find((c) => c.name.toLowerCase() === key) ?? null;
    },

    async getAllCategories() {
      await db.read();
      return [...db.data.categories].sort((a, b) => {
        if (a.isPreset !== b.isPreset) return a.isPreset ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    },

    async seedIfEmpty(seedList) {
      await db.read();
      if (db.data.categories.length > 0) return;
      for (const c of seedList) {
        db.data.categories.push({
          _id: uuidv4(),
          name: c.name,
          colour: c.colour,
          isPreset: true,
        });
      }
      await db.write();
    },
  };
}
