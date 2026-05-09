import { v4 as uuidv4 } from "uuid";
import { initStore } from "@/core/data/store-utils.js";

/**
 * User store backed by a JSON file in the project-root data directory.
 */
export function createJsonUserStore() {
  const db = initStore("users");

  return {
    async addUser(user) {
      await db.read();
      const record = { ...user, _id: uuidv4() };
      db.data.users.push(record);
      await db.write();
    },

    async getUserByEmail(email) {
      await db.read();
      const key = email.toLowerCase();
      return db.data.users.find((u) => u.email?.toLowerCase() === key) ?? null;
    },

    async getUserById(id) {
      await db.read();
      return db.data.users.find((u) => u._id === id) ?? null;
    },

    async updateUser(id, updates) {
      await db.read();
      const user = db.data.users.find((u) => u._id === id);
      if (!user) return null;
      Object.assign(user, updates);
      await db.write();
      return user;
    },

    async deleteUser(id) {
      await db.read();
      const i = db.data.users.findIndex((u) => u._id === id);
      if (i === -1) return null;
      db.data.users.splice(i, 1);
      await db.write();
      return true;
    },
  };
}
