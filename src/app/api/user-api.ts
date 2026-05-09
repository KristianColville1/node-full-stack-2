import { db } from "@/core/data/db.js";
import { hashPassword, verifyPassword } from "@/core/security/passwords.js";

export const userApi = {
  create: {
    handler: async function (request, h) {
      const { email, password, firstName, lastName } = request.payload;
      await db.userStore.addUser({
        email,
        password: await hashPassword(password),
        firstName,
        lastName,
      });
      const user = await db.userStore.getUserByEmail(email);
      const { password: _, ...safe } = user ?? {};
      return h.response(safe).code(201);
    },
  },
  authenticate: {
    handler: async function (request, h) {
      const { email, password } = request.payload;
      const user = await db.userStore.getUserByEmail(email);
      if (!user || !(await verifyPassword(password, user.password))) {
        return h.response({ error: "Invalid email or password" }).code(401);
      }
      const { password: _, ...safe } = user;
      return h.response(safe).code(200);
    },
  },
};
