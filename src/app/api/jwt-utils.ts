import jwt from "jsonwebtoken";
import { env } from "@/core/config/env.js";
import { db } from "@/core/data/db.js";

/**
 * Token payload shape: { id, email } — `id` is the user's `_id`.
 * Keep this consistent across createToken / decodeToken / validateJWT so
 * downstream code only ever has to know one field name.
 */
export function createToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
  };
  const options = {
    algorithm: "HS256",
    expiresIn: "1h",
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function decodeToken(token) {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return { id: decoded.id, email: decoded.email };
  } catch (e) {
    return null;
  }
}

export async function validateJWT(decoded, request) {
  const user = await db.userStore.getUserById(decoded.id);
  if (!user) {
    return { isValid: false };
  }
  return { isValid: true, credentials: user };
}
