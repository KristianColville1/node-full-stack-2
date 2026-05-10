import { v4 as uuidv4 } from "uuid";
import type { ICategoryStore } from "@/app/data/stores/interfaces/index.js";

/**
 * In-memory category store. Backed by a private array; no persistence.
 */
export class MemoryCategoryStore implements ICategoryStore {
  private categories = [];

  async addCategory(category) {
    const record = {
      _id: uuidv4(),
      name: category.name,
      colour: category.colour,
      isPreset: !!category.isPreset,
    };
    this.categories.push(record);
    return record;
  }

  async getByName(name) {
    if (!name) return null;
    const key = String(name).toLowerCase();
    return this.categories.find((c) => c.name.toLowerCase() === key) ?? null;
  }

  async getAllCategories() {
    return [...this.categories].sort((a, b) => {
      if (a.isPreset !== b.isPreset) return a.isPreset ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  async seedIfEmpty(seedList) {
    if (this.categories.length > 0) return;
    for (const c of seedList) {
      await this.addCategory({ ...c, isPreset: true });
    }
  }
}
