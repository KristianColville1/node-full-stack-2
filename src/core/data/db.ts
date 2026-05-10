import { MemoryCafeStore, MemoryUserStore, MemoryCategoryStore } from "@/app/data/stores/memory/index.js";
import { createJsonCafeStore, createJsonUserStore, createJsonCategoryStore } from "@/app/data/stores/json/index.js";
import { env } from "@/core/config/env.js";

/**
 * App db facade
 */
export const db = {
  userStore: null as any,
  cafeStore: null as any,
  categoryStore: null as any,
};

/**
 * Initialise the configured stores.
 * `baseDir` is forwarded to JSON stores so tests can redirect file writes
 * to a tmp directory rather than the project's `data/` folder.
 */
export function initStores(storageType?: string, baseDir?: string) {
  const type = storageType ?? env.STORAGE;
  switch (type) {
    case "memory":
      db.userStore = new MemoryUserStore();
      db.cafeStore = new MemoryCafeStore();
      db.categoryStore = new MemoryCategoryStore();
      break;
    case "json":
      db.userStore = createJsonUserStore(baseDir);
      db.cafeStore = createJsonCafeStore(baseDir);
      db.categoryStore = createJsonCategoryStore(baseDir);
      break;
    case "mongo":
      throw new Error("Mongo stores not yet implemented");
    case "firebase":
      throw new Error("Firebase stores not yet implemented");
    default:
      throw new Error(`Unknown storage type: ${type}`);
  }
}
