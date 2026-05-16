import { v4 as uuidv4 } from "uuid";
import { initStore } from "@/core/data/store-utils.js";

/**
 * Defaults missing `role` to "user" on read so records persisted before the
 * admin feature shipped continue to work without a migration step.
 */
function withRoleDefault(user) {
  if (!user) return user;
  return user.role ? user : { ...user, role: "user" };
}

/**
 * User store backed by a JSON file in the project-root data directory.
 * `baseDir` lets tests redirect writes to a temp directory.
 */
export function createJsonUserStore(baseDir) {
  const db = initStore("users", baseDir);

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
      const found = db.data.users.find((u) => u.email?.toLowerCase() === key) ?? null;
      return withRoleDefault(found);
    },

    async getUserById(id) {
      await db.read();
      const found = db.data.users.find((u) => u._id === id) ?? null;
      return withRoleDefault(found);
    },

    async getAllUsers() {
      await db.read();
      return db.data.users.map((u) => withRoleDefault(u));
    },

    async updateUser(id, updates) {
      await db.read();
      const user = db.data.users.find((u) => u._id === id);
      if (!user) return null;
      Object.assign(user, updates);
      await db.write();
      return withRoleDefault(user);
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
