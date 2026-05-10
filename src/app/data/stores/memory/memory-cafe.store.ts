import { v4 as uuidv4 } from "uuid";
import type { ICafeStore } from "@/app/data/stores/interfaces/index.js";

/**
 * In-memory cafe store. CRUD, query, group by category.
 */


export class MemoryCafeStore implements ICafeStore {
  private cafes = [];

  async addCafe(cafe) {
    const id = uuidv4();
    const newCafe = { ...cafe, _id: id };
    this.cafes.push(newCafe);
    return newCafe;
  }

  async getCafeById(id) {
    return this.cafes.find((c) => c._id === id);
  }

  async getAllCafes() {
    return this.cafes;
  }

  async updateCafe(id, cafe) {
    const existing = this.cafes.find((c) => c._id === id);
    if (!existing) return;
    this.cafes = this.cafes.map((c) => c._id === id ? { ...c, ...cafe } : c);
  }

  async deleteCafe(id) {
    this.cafes = this.cafes.filter((c) => c._id !== id);
  }

  async getByCategory(category) {
    return this.cafes.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }

  async deleteByUserId(userId) {
    this.cafes = this.cafes.filter((c) => c.userId !== userId);
  }
}
