import { suite, test } from "mocha";
import { assert } from "chai";
import { resolveStorage, validateEnv } from "@/core/config/env.js";

suite("Core - config - resolveStorage", () => {
  test("returns explicit STORAGE value when set, regardless of NODE_ENV", () => {
    assert.strictEqual(resolveStorage("production", "json"), "json");
    assert.strictEqual(resolveStorage("development", "mongo"), "mongo");
    assert.strictEqual(resolveStorage("test", "memory"), "memory");
  });

  test("defaults to memory in test", () => {
    assert.strictEqual(resolveStorage("test", undefined), "memory");
  });

  test("defaults to memory in development", () => {
    assert.strictEqual(resolveStorage("development", undefined), "memory");
  });

  test("throws in production when STORAGE is unset", () => {
    assert.throws(
      () => resolveStorage("production", undefined),
      /STORAGE env var is required in production/,
    );
  });

  test("throws in production when STORAGE is empty string", () => {
    assert.throws(
      () => resolveStorage("production", ""),
      /STORAGE env var is required in production/,
    );
  });
});

const goodEnv = () => ({
  NODE_ENV: "test",
  HOST: "0.0.0.0",
  PORT: 3000,
  STORAGE: "memory",
  COOKIE_NAME: "beanmap-session",
  COOKIE_PASSWORD: "x".repeat(32),
  JWT_SECRET: "y".repeat(32),
});

suite("Core - config - validateEnv", () => {
  test("passes through a fully valid env object", () => {
    const result = validateEnv(goodEnv());
    assert.deepEqual(result, goodEnv());
  });

  test("throws with a clear message when COOKIE_PASSWORD is missing", () => {
    const e = goodEnv();
    delete e.COOKIE_PASSWORD;
    assert.throws(() => validateEnv(e), /COOKIE_PASSWORD/);
  });

  test("throws when COOKIE_PASSWORD is too short", () => {
    const e = goodEnv();
    e.COOKIE_PASSWORD = "tooshort";
    assert.throws(() => validateEnv(e), /COOKIE_PASSWORD/);
  });

  test("throws when JWT_SECRET is missing", () => {
    const e = goodEnv();
    delete e.JWT_SECRET;
    assert.throws(() => validateEnv(e), /JWT_SECRET/);
  });

  test("throws on unknown STORAGE value", () => {
    const e = goodEnv();
    e.STORAGE = "redis";
    assert.throws(() => validateEnv(e), /STORAGE/);
  });

  test("throws once and lists every problem when several keys are bad", () => {
    const e = goodEnv();
    delete e.COOKIE_PASSWORD;
    delete e.JWT_SECRET;
    delete e.COOKIE_NAME;
    try {
      validateEnv(e);
      assert.fail("expected validateEnv to throw");
    } catch (err) {
      const msg = (err as Error).message;
      assert.include(msg, "COOKIE_PASSWORD");
      assert.include(msg, "JWT_SECRET");
      assert.include(msg, "COOKIE_NAME");
    }
  });
});
