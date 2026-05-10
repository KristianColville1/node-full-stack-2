import { before, suite, test } from "mocha";
import { assert } from "chai";
import { server } from "@/server.js";
import { initStores } from "@/core/data/db.js";

const apiUser = {
  firstName: "Api",
  lastName: "Tester",
  email: "api-tester@example.com",
  password: "password123",
};

async function ensureUserAndGetToken(): Promise<string> {
  // signup is idempotent for our purposes — 409 on second call is fine, the user still exists
  await server.inject({ method: "POST", url: "/api/users", payload: apiUser });
  const res = await server.inject({
    method: "POST",
    url: "/api/users/authenticate",
    payload: { email: apiUser.email, password: apiUser.password },
  });
  return JSON.parse(res.payload).token;
}

suite("Cafe API — JWT enforcement", () => {
  before(() => {
    initStores("memory");
  });

  test("POST /api/users/authenticate returns a token + user (no password) on success", async () => {
    await server.inject({ method: "POST", url: "/api/users", payload: apiUser });
    const res = await server.inject({
      method: "POST",
      url: "/api/users/authenticate",
      payload: { email: apiUser.email, password: apiUser.password },
    });
    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.isString(body.token);
    assert.exists(body.user);
    assert.notExists(body.user.password);
  });

  test("GET /api/cafes without token returns 401", async () => {
    const res = await server.inject({ method: "GET", url: "/api/cafes" });
    assert.strictEqual(res.statusCode, 401);
  });

  test("GET /api/cafes with Bearer token returns 200", async () => {
    const token = await ensureUserAndGetToken();
    const res = await server.inject({
      method: "GET",
      url: "/api/cafes",
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(res.statusCode, 200);
  });

  test("POST /api/cafes without token returns 401", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/cafes",
      payload: { name: "X", category: "Y", description: "z", latitude: 0, longitude: 0 },
    });
    assert.strictEqual(res.statusCode, 401);
  });

  test("POST /api/cafes with Bearer token returns 201", async () => {
    const token = await ensureUserAndGetToken();
    const res = await server.inject({
      method: "POST",
      url: "/api/cafes",
      headers: { Authorization: `Bearer ${token}` },
      payload: { name: "Token Cafe", category: "API", description: "via API", latitude: 0, longitude: 0 },
    });
    assert.strictEqual(res.statusCode, 201);
  });

  test("GET /api/cafes/{id} without token returns 401", async () => {
    const res = await server.inject({ method: "GET", url: "/api/cafes/any-id" });
    assert.strictEqual(res.statusCode, 401);
  });

  test("PUT /api/cafes/{id} without token returns 401", async () => {
    const res = await server.inject({ method: "PUT", url: "/api/cafes/any-id", payload: { name: "X" } });
    assert.strictEqual(res.statusCode, 401);
  });

  test("DELETE /api/cafes/{id} without token returns 401", async () => {
    const res = await server.inject({ method: "DELETE", url: "/api/cafes/any-id" });
    assert.strictEqual(res.statusCode, 401);
  });

  test("GET /api/cafes/category/{category} without token returns 401", async () => {
    const res = await server.inject({ method: "GET", url: "/api/cafes/category/foo" });
    assert.strictEqual(res.statusCode, 401);
  });

  test("POST /api/users (signup) does NOT require a token (open endpoint)", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/users",
      payload: { firstName: "F", lastName: "L", email: "open-signup@example.com", password: "password123" },
    });
    // 201 created, OR 409 if a previous test left this email — both prove the route is open
    assert.notStrictEqual(res.statusCode, 401);
  });
});
