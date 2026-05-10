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

  test("POST /account/delete cascades — user's cafes are removed too", async () => {
    // Use a fresh email so we can isolate this user's cafés
    const cascadePayload = { ...signupPayload, email: "cascade@example.com" };
    await server.inject({ method: "POST", url: "/signup", payload: cascadePayload });
    const login = await server.inject({ method: "POST", url: "/login", payload: { email: cascadePayload.email, password: cascadePayload.password } });
    const cookie = login.headers["set-cookie"]?.[0]?.match(/^([^;]+)/)?.[1] ?? "";
    const cafePayload = { name: "Cascade Cafe", category: "Test", description: "x", latitude: 0, longitude: 0 };
    await server.inject({ method: "POST", url: "/cafes", payload: cafePayload, headers: { cookie } });
    await server.inject({ method: "POST", url: "/cafes", payload: { ...cafePayload, name: "Cascade Cafe 2" }, headers: { cookie } });
    const userBefore = await db.userStore.getUserByEmail(cascadePayload.email);
    const cafesBefore = (await db.cafeStore.getAllCafes()).filter((c: any) => c.userId === userBefore._id);
    assert.strictEqual(cafesBefore.length, 2, "expected 2 cafes for the cascade user before delete");
    await server.inject({ method: "POST", url: "/account/delete", headers: { cookie } });
    const userAfter = await db.userStore.getUserByEmail(cascadePayload.email);
    assert.notExists(userAfter, "user should be gone after self-delete");
    const cafesAfter = (await db.cafeStore.getAllCafes()).filter((c: any) => c.userId === userBefore._id);
    assert.strictEqual(cafesAfter.length, 0, "all of user's cafes should be cascade-deleted");
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

  test("POST /account with auth and valid update redirects to /account?updated=1", async () => {
    const updateUser = { firstName: "U", lastName: "P", email: "update-success@example.com", password: "password123" };
    await server.inject({ method: "POST", url: "/signup", payload: updateUser });
    const login = await server.inject({ method: "POST", url: "/login", payload: { email: updateUser.email, password: updateUser.password } });
    const cookie = login.headers["set-cookie"]?.[0]?.match(/^([^;]+)/)?.[1] ?? "";
    const res = await server.inject({
      method: "POST",
      url: "/account",
      payload: { firstName: "Updated", lastName: "Name", email: updateUser.email },
      headers: { cookie },
    });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "/account");
    assert.include(res.headers.location, "updated=1");
  });

  test("POST /account with auth and an email already taken redirects to /account?error=email-taken", async () => {
    const u1 = { firstName: "A", lastName: "A", email: "collide-a@example.com", password: "password123" };
    const u2 = { firstName: "B", lastName: "B", email: "collide-b@example.com", password: "password123" };
    await server.inject({ method: "POST", url: "/signup", payload: u1 });
    await server.inject({ method: "POST", url: "/signup", payload: u2 });
    const login = await server.inject({ method: "POST", url: "/login", payload: { email: u2.email, password: u2.password } });
    const cookie = login.headers["set-cookie"]?.[0]?.match(/^([^;]+)/)?.[1] ?? "";
    const res = await server.inject({
      method: "POST",
      url: "/account",
      payload: { firstName: "B", lastName: "B", email: u1.email },
      headers: { cookie },
    });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "/account");
    assert.include(res.headers.location, "error=email-taken");
  });
});

