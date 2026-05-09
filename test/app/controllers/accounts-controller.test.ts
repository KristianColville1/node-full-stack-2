import { before, suite, test } from "mocha";
import { assert } from "chai";
import { server } from "@/server.js";
import { db, initStores } from "@/core/data/db.js";
import { accountsController } from "@/app/controllers/accounts-controller.js";
import { countControllerEndpoints, assertControllerEndpointCount } from "../../helpers/controller-count.js";
import { signupPayload, loginPayload, updatePayload } from "../../fixtures/accounts.js";

const EXPECTED_ENDPOINT_COUNT = 9;

suite("Accounts controller", () => {
  before(() => {
    initStores("memory");
  });

  test("endpoint count matches EXPECTED_ENDPOINT_COUNT (add/remove tests when controller changes)", () => {
    const actual = countControllerEndpoints(accountsController as Record<string, unknown>);
    assertControllerEndpointCount(actual, EXPECTED_ENDPOINT_COUNT, "Accounts", assert);
  });

  test("index handler returns main view", () => {
    const h = { view: (name: string) => ({ view: name }) };
    const result = (accountsController.index as any).handler({}, h);
    assert.strictEqual(result.view, "main");
  });

  test("GET /signup returns 200", async () => {
    const res = await server.inject({ method: "GET", url: "/signup" });
    assert.strictEqual(res.statusCode, 200);
  });

  test("POST /signup with valid payload redirects to /", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/signup",
      payload: signupPayload,
    });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "/");
  });

  test("POST /signup stores password hashed, never plaintext", async () => {
    await server.inject({ method: "POST", url: "/signup", payload: signupPayload });
    const stored = await db.userStore.getUserByEmail(signupPayload.email);
    assert.exists(stored, "user not found in store after signup");
    assert.notStrictEqual(stored.password, signupPayload.password, "stored password is plaintext");
    assert.include(stored.password, ":", "stored password should be salt:hash format");
  });

  test("POST /signup with already-taken email redirects to /signup?error=email-taken", async () => {
    await server.inject({ method: "POST", url: "/signup", payload: signupPayload });
    const res = await server.inject({ method: "POST", url: "/signup", payload: signupPayload });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "/signup");
    assert.include(res.headers.location, "error=email-taken");
  });

  test("GET /login returns 200", async () => {
    const res = await server.inject({ method: "GET", url: "/login" });
    assert.strictEqual(res.statusCode, 200);
  });

  test("POST /login with fixture user redirects to /dashboard", async () => {
    await server.inject({ method: "POST", url: "/signup", payload: signupPayload });
    const res = await server.inject({
      method: "POST",
      url: "/login",
      payload: loginPayload,
    });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "/dashboard");
  });

  test("GET /logout redirects to /", async () => {
    const res = await server.inject({ method: "GET", url: "/logout" });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "/");
  });

  test("GET /account without auth redirects to login", async () => {
    const res = await server.inject({ method: "GET", url: "/account" });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "/login");
  });

  test("POST /account without auth redirects to login", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/account",
      payload: updatePayload,
    });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "/login");
  });

  test("POST /account/delete without auth redirects to login", async () => {
    const res = await server.inject({ method: "POST", url: "/account/delete" });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "/login");
  });
});

