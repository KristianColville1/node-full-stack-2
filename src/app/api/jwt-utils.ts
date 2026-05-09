import jwt from "jsonwebtoken";
import { env } from "@/core/config/env.js";
import { db } from "@/core/data/db.js";

export function createToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
  };
  const options = {
    algorithm: "HS256",
    expiresIn: "1h",
  };
  return jwt.sign(payload, env.COOKIE_PASSWORD, options);
}

export function decodeToken(token) {
  const userInfo = {} as { userId: string; email: string };
  try {
      const decoded = jwt.verify(token, env.COOKIE_PASSWORD);
      
    userInfo.userId = decoded.id;
    userInfo.email = decoded.email;
  } catch (e) {
    console.log(e.message);
  }
  return userInfo;
}

export async function validateJWT(decoded, request) {
  const user = await db.userStore.getUserById(decoded.id);
  if (!user) {
    return { isValid: false };
  }
  return { isValid: true, credentials: user };
}
