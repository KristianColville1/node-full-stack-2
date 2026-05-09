import { v4 as uuidv4 } from "uuid";
import type { IUserStore } from "@/app/data/stores/interfaces/index.js";

/**
 * In-memory user store. No persistence; data lives in process memory.
 */
export class MemoryUserStore implements IUserStore {
  private users = new Map();

  async addUser(user) {
    const id = uuidv4();
    this.users.set(user.email.toLowerCase(), { ...user, _id: id });
  }

  async getUserByEmail(email) {
    return this.users.get(email.toLowerCase()) ?? null;
  }

  async getUserById(id) {
    const u = [...this.users.values()].find((r) => r._id === id);
    return u ?? null;
  }

  async updateUser(id, updates) {
    const user = await this.getUserById(id);
    if (!user) return null;
    if (updates.email && updates.email !== user.email) {
      this.users.delete(user.email?.toLowerCase());
      this.users.set(updates.email.toLowerCase(), user);
    }
    Object.assign(user, updates);
    return user;
  }

  async deleteUser(id) {
    const user = await this.getUserById(id);
    if (!user) return null;
    this.users.delete(user.email?.toLowerCase());
    return true;
  }
}
