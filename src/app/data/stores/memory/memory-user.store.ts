import { v4 as uuidv4 } from "uuid";
import type { IUserStore } from "@/app/data/stores/interfaces/index.js";

/**
 * In-memory user store. No persistence; data lives in process memory.
 *
 * Defaults missing `role` to "user" on read so records persisted before the
 * admin feature shipped continue to work without migration.
 */
function withRoleDefault(user) {
  if (!user) return user;
  return user.role ? user : { ...user, role: "user" };
}

export class MemoryUserStore implements IUserStore {
  private users = new Map();

  async addUser(user) {
    const id = uuidv4();
    this.users.set(user.email.toLowerCase(), { ...user, _id: id });
  }

  async getUserByEmail(email) {
    return withRoleDefault(this.users.get(email.toLowerCase()) ?? null);
  }

  async getUserById(id) {
    const u = [...this.users.values()].find((r) => r._id === id);
    return withRoleDefault(u ?? null);
  }

  async getAllUsers() {
    return [...this.users.values()].map((u) => withRoleDefault(u));
  }

  async updateUser(id, updates) {
    const user = [...this.users.values()].find((r) => r._id === id);
    if (!user) return null;
    if (updates.email && updates.email !== user.email) {
      this.users.delete(user.email?.toLowerCase());
      this.users.set(updates.email.toLowerCase(), user);
    }
    Object.assign(user, updates);
    return withRoleDefault(user);
  }

  async deleteUser(id) {
    const user = [...this.users.values()].find((r) => r._id === id);
    if (!user) return null;
    this.users.delete(user.email?.toLowerCase());
    return true;
  }
}
