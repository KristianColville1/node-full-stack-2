import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

/**
 * Resolve the storage backend from env. In production STORAGE must be set
 * explicitly so a forgotten env var doesn't silently boot in-memory and lose
 * data on every restart. In test / dev, default to memory.
 */
export function resolveStorage(nodeEnv, storage) {
  if (storage) return storage;
  if (nodeEnv === "production") {
    throw new Error(
      "STORAGE env var is required in production (set to 'json' or 'mongo')",
    );
  }
  return "memory";
}

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").required(),
  HOST: Joi.string().required(),
  PORT: Joi.number().integer().positive().required(),
  STORAGE: Joi.string().valid("memory", "json", "mongo", "firebase").required(),
  COOKIE_NAME: Joi.string().required(),
  COOKIE_PASSWORD: Joi.string().min(32).required(),
  JWT_SECRET: Joi.string().min(32).required(),
});

/**
 * Validate the assembled env object. Throws once, listing every problem,
 * so a misconfigured deploy fails fast at startup with an actionable message.
 */
export function validateEnv(rawEnv) {
  const { error, value } = envSchema.validate(rawEnv, { abortEarly: false, convert: true });
  if (error) {
    const messages = error.details.map((d) => `  - ${d.message}`).join("\n");
    throw new Error(`Invalid env config:\n${messages}`);
  }
  return value;
}

const NODE_ENV = process.env.NODE_ENV ?? "development";

export const env = validateEnv({
  NODE_ENV,
  HOST: process.env.HOST ?? "0.0.0.0",
  PORT: Number(process.env.PORT ?? "3000"),
  STORAGE: resolveStorage(NODE_ENV, process.env.STORAGE),
  COOKIE_NAME: process.env.COOKIE_NAME,
  COOKIE_PASSWORD: process.env.COOKIE_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
});
