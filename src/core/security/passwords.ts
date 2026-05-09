import crypto from "crypto";
import { promisify } from "util";

const pbkdf2 = promisify(crypto.pbkdf2);

const ALGO = "sha256";
const SALT_BYTES = 16;
const ITERATIONS = 100_000;
const KEY_LEN = 64;

/**
 * Hash a plaintext password with a fresh per-user salt.
 * Returns a single string salt:hash (both hex) for storage.
 */
export async function hashPassword(plaintext) {
  const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
  const derived = await pbkdf2(plaintext, salt, ITERATIONS, KEY_LEN, ALGO);
  return `${salt}:${derived.toString("hex")}`;
}

/**
 * Verify a plaintext password against a stored salt:hash string.
 * Constant-time comparison; returns false for any malformed input.
 */
export async function verifyPassword(plaintext, stored) {
  if (typeof stored !== "string" || !stored.includes(":")) return false;
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const derived = await pbkdf2(plaintext, salt, ITERATIONS, KEY_LEN, ALGO);
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}
