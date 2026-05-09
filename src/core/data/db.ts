import { MemoryCafeStore, MemoryUserStore } from "@/app/data/stores/memory/index.js";
import { createJsonCafeStore, createJsonUserStore } from "@/app/data/stores/json/index.js";
import { env } from "@/core/config/env.js";

/**
 * App db facade
 */
export const db = {
  userStore: null as any,
  cafeStore: null as any,
};

export function initStores(storageType?: string) {
  const type = storageType ?? env.STORAGE;
  switch (type) {
    case "memory":
      db.userStore = new MemoryUserStore();
      db.cafeStore = new MemoryCafeStore();
      break;
    case "json":
      db.userStore = createJsonUserStore();
      db.cafeStore = createJsonCafeStore();
      break;
    case "mongo":
      throw new Error("Mongo stores not yet implemented");
    case "firebase":
      throw new Error("Firebase stores not yet implemented");
    default:
      throw new Error(`Unknown storage type: ${type}`);
  }
}
