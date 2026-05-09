import { before, suite, test } from "mocha";
import { assert } from "chai";
import jwt from "jsonwebtoken";
import { db, initStores } from "@/core/data/db.js";
import { env } from "@/core/config/env.js";
import { createToken, decodeToken, validateJWT } from "@/app/api/jwt-utils.js";

suite("JWT utils", () => {
  before(() => {
    initStores("memory");
  });

  test("createToken + decodeToken round-trip preserves id and email", () => {
    const token = createToken({ _id: "abc-123", email: "round@trip.com" });
    const decoded = decodeToken(token);
    assert.exists(decoded);
    assert.strictEqual(decoded!.id, "abc-123");
    assert.strictEqual(decoded!.email, "round@trip.com");
  });

  test("decodeToken returns null on a tampered token", () => {
    const token = createToken({ _id: "x", email: "x@x.com" });
    const tampered = token.slice(0, -2) + (token.endsWith("aa") ? "bb" : "aa");
    assert.isNull(decodeToken(tampered));
  });

  test("validateJWT looks up the user by decoded.id and returns them as credentials", async () => {
    await db.userStore.addUser({ email: "jwt@example.com", password: "x", firstName: "J", lastName: "W" });
    const stored = await db.userStore.getUserByEmail("jwt@example.com");
    const token = createToken(stored);
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; email: string };
    const result = await validateJWT(decoded, {} as any);
    assert.isTrue(result.isValid);
    assert.strictEqual((result.credentials as any)._id, stored._id);
    assert.strictEqual((result.credentials as any).email, stored.email);
  });

  test("validateJWT returns isValid=false when the user no longer exists", async () => {
    const result = await validateJWT({ id: "no-such-user" }, {} as any);
    assert.isFalse(result.isValid);
  });
});
