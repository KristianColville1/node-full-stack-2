import { before, suite, test } from "mocha";
import { assert } from "chai";
import { server } from "@/server.js";
import { db, initStores } from "@/core/data/db.js";
import { adminController } from "@/app/controllers/admin-controller.js";
import { countControllerEndpoints, assertControllerEndpointCount } from "../../helpers/controller-count.js";
import { addCafePayload } from "../../fixtures/cafes.js";

const EXPECTED_ENDPOINT_COUNT = 4;

const ADMIN = { firstName: "Ad", lastName: "Min", email: "admin@beanmap.com", password: "password123" };
const REGULAR = { firstName: "Reg", lastName: "Ular", email: "regular@beanmap.com", password: "password123" };

async function signupAndPromote(payload, role) {
  await server.inject({ method: "POST", url: "/signup", payload });
  if (role === "admin") {
    const u = await db.userStore.getUserByEmail(payload.email);
    await db.userStore.updateUser(u._id, { role: "admin" });
  }
}

async function loginCookie(payload): Promise<string> {
  const res = await server.inject({
    method: "POST",
    url: "/login",
    payload: { email: payload.email, password: payload.password },
  });
  const setCookie = res.headers["set-cookie"];
  if (!setCookie) return "";
  const match = (setCookie[0] as string).match(/^([^;]+)/);
  return match ? match[1] : "";
}

suite("Admin controller", () => {
  before(() => {
    initStores("memory");
  });

  test("endpoint count matches EXPECTED_ENDPOINT_COUNT", () => {
    const actual = countControllerEndpoints(adminController as Record<string, unknown>);
    assertControllerEndpointCount(actual, EXPECTED_ENDPOINT_COUNT, "Admin", assert);
  });

  test("non-admin GET /admin returns 403", async () => {
    initStores("memory");
    await signupAndPromote(REGULAR, "user");
    const cookie = await loginCookie(REGULAR);
    const res = await server.inject({ method: "GET", url: "/admin", headers: { cookie } });
    assert.strictEqual(res.statusCode, 403);
  });

  test("anonymous GET /admin redirects to login", async () => {
    const res = await server.inject({ method: "GET", url: "/admin" });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "/login");
  });

  test("admin GET /admin returns 200 with stats in the page", async () => {
    initStores("memory");
    await signupAndPromote(ADMIN, "admin");
    const cookie = await loginCookie(ADMIN);
    const res = await server.inject({ method: "GET", url: "/admin", headers: { cookie } });
    assert.strictEqual(res.statusCode, 200);
    assert.include(res.payload, "Users");
    assert.include(res.payload, "Total views");
  });

  test("admin GET /admin/users lists every signed-up user", async () => {
    initStores("memory");
    await signupAndPromote(ADMIN, "admin");
    await signupAndPromote(REGULAR, "user");
    const cookie = await loginCookie(ADMIN);
    const res = await server.inject({ method: "GET", url: "/admin/users", headers: { cookie } });
    assert.strictEqual(res.statusCode, 200);
    assert.include(res.payload, ADMIN.email);
    assert.include(res.payload, REGULAR.email);
  });

  test("admin POST /admin/users/{id}/delete cascades the user's cafes", async () => {
    initStores("memory");
    await signupAndPromote(ADMIN, "admin");
    await signupAndPromote(REGULAR, "user");
    const cookie = await loginCookie(REGULAR);
    await server.inject({ method: "POST", url: "/cafes", payload: addCafePayload, headers: { cookie } });
    await server.inject({ method: "POST", url: "/cafes", payload: { ...addCafePayload, name: "Second" }, headers: { cookie } });
    const before = await db.cafeStore.getAllCafes();
    assert.lengthOf(before, 2);

    const adminCookie = await loginCookie(ADMIN);
    const target = await db.userStore.getUserByEmail(REGULAR.email);
    const res = await server.inject({
      method: "POST",
      url: `/admin/users/${target._id}/delete`,
      headers: { cookie: adminCookie },
    });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "/admin/users");

    const after = await db.cafeStore.getAllCafes();
    assert.lengthOf(after, 0);
    const stillThere = await db.userStore.getUserByEmail(REGULAR.email);
    assert.notExists(stillThere);
  });

  test("admin cannot delete their own account from the admin panel", async () => {
    initStores("memory");
    await signupAndPromote(ADMIN, "admin");
    const cookie = await loginCookie(ADMIN);
    const me = await db.userStore.getUserByEmail(ADMIN.email);
    const res = await server.inject({
      method: "POST",
      url: `/admin/users/${me._id}/delete`,
      headers: { cookie },
    });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "cannot-self-delete");
    const stillThere = await db.userStore.getUserByEmail(ADMIN.email);
    assert.exists(stillThere);
  });
});
