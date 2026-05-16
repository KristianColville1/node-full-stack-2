import { db } from "@/core/data/db.js";
import { hashPassword, verifyPassword } from "@/core/security/passwords.js";
import { createToken } from "@/app/api/jwt-utils.js";
import { UserResponseSpec, ErrorResponseSpec } from "@/app/data/schema/joi-schemas.js";
import Joi from "joi";

const TokenResponseSpec = Joi.object({
  user: UserResponseSpec,
  token: Joi.string(),
}).label("AuthResponse");

export const userApi = {
  create: {
    auth: false,
    tags: ["api", "users"],
    description: "Sign up a new user",
    notes: "Creates a new user account. Returns the user (without password).",
    plugins: {
      "hapi-swagger": {
        responses: {
          "201": { description: "Created", schema: UserResponseSpec },
          "409": { description: "Email already taken", schema: ErrorResponseSpec },
        },
      },
    },
    handler: async function (request, h) {
      const { email, password, firstName, lastName } = request.payload;
      const existing = await db.userStore.getUserByEmail(email);
      if (existing) {
        return h.response({ error: "An account with that email already exists" }).code(409);
      }
      await db.userStore.addUser({
        email,
        password: await hashPassword(password),
        firstName,
        lastName,
        role: "user",
      });
      const user = await db.userStore.getUserByEmail(email);
      const { password: _, ...safe } = user ?? {};
      return h.response(safe).code(201);
    },
  },
  authenticate: {
    auth: false,
    tags: ["api", "users"],
    description: "Authenticate and mint a JWT",
    notes: "On success, returns the user (without password) and a signed JWT for the API.",
    plugins: {
      "hapi-swagger": {
        responses: {
          "200": { description: "OK", schema: TokenResponseSpec },
          "401": { description: "Invalid credentials", schema: ErrorResponseSpec },
        },
      },
    },
    handler: async function (request, h) {
      const { email, password } = request.payload;
      const user = await db.userStore.getUserByEmail(email);
      if (!user || !(await verifyPassword(password, user.password))) {
        return h.response({ error: "Invalid email or password" }).code(401);
      }
      const { password: _, ...safe } = user;
      const token = createToken(user);
      return h.response({ user: safe, token }).code(200);
    },
  },
};
