import { before, suite, test } from "mocha";
import { assert } from "chai";
import { server } from "@/server.js";
import { initStores } from "@/core/data/db.js";
import { db } from "@/core/data/db.js";
import { PRESET_CATEGORIES } from "@/app/data/categories.js";
import { cafeController } from "@/app/controllers/cafe-controller.js";
import { countControllerEndpoints, assertControllerEndpointCount } from "../../helpers/controller-count.js";
import { addCafePayload } from "../../fixtures/cafes.js";
import { signupPayload, loginPayload } from "../../fixtures/accounts.js";

const EXPECTED_ENDPOINT_COUNT = 5; // update when adding/removing endpoints; add a test for each

function getAuthCookie(): Promise<string> {
  return server
    .inject({ method: "POST", url: "/signup", payload: signupPayload })
    .then(() => server.inject({ method: "POST", url: "/login", payload: loginPayload }))
    .then((res) => {
      const setCookie = res.headers["set-cookie"];
      if (!setCookie) return "";
      const match = setCookie[0].match(/^([^;]+)/);
      return match ? match[1] : "";
    });
}

suite("Cafe controller", () => {
  before(async () => {
    initStores("memory");
    await db.categoryStore.seedIfEmpty(PRESET_CATEGORIES);
  });

  test("endpoint count matches EXPECTED_ENDPOINT_COUNT (add/remove tests when controller changes)", () => {
    const actual = countControllerEndpoints(cafeController as Record<string, unknown>);
    assertControllerEndpointCount(actual, EXPECTED_ENDPOINT_COUNT, "Cafe", assert);
  });

  test("GET /cafes without auth redirects to login", async () => {
    const res = await server.inject({ method: "GET", url: "/cafes" });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "/login");
  });

  test("GET /cafes with auth returns 200", async () => {
    const cookie = await getAuthCookie();
    const res = await server.inject({
      method: "GET",
      url: "/cafes",
      headers: { cookie },
    });
    assert.strictEqual(res.statusCode, 200);
  });

  test("POST /cafes with auth and valid payload redirects to /dashboard", async () => {
    const cookie = await getAuthCookie();
    const res = await server.inject({
      method: "POST",
      url: "/cafes",
      payload: addCafePayload,
      headers: { cookie },
    });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "/dashboard");
  });

  test("POST /cafes/:id/delete with auth as owner redirects to /cafes", async () => {
    const cookie = await getAuthCookie();
    await server.inject({
      method: "POST",
      url: "/cafes",
      payload: addCafePayload,
      headers: { cookie },
    });
    const cafes = await db.cafeStore.getAllCafes();
    const id = cafes[0]._id;
    const res = await server.inject({
      method: "POST",
      url: `/cafes/${id}/delete`,
      headers: { cookie },
    });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "/cafes");
  });

  test("GET /cafes/:id increments analytics.views on each hit (persists across requests)", async () => {
    const cookie = await getAuthCookie();
    await server.inject({
      method: "POST",
      url: "/cafes",
      payload: { ...addCafePayload, name: "View Counter Cafe" },
      headers: { cookie },
    });
    const all = await db.cafeStore.getAllCafes();
    const target = all.find((c: any) => c.name === "View Counter Cafe");
    assert.exists(target);
    await server.inject({ method: "GET", url: `/cafes/${target._id}`, headers: { cookie } });
    await server.inject({ method: "GET", url: `/cafes/${target._id}`, headers: { cookie } });
    const after = await db.cafeStore.getCafeById(target._id);
    assert.strictEqual(after.analytics?.views, 2);
  });

  test("GET /cafes/category/:category renders 200 with only that category's cafes", async () => {
    const cookie = await getAuthCookie();
    await server.inject({ method: "POST", url: "/cafes", payload: { ...addCafePayload, name: "Latte Spot", category: "Latte" }, headers: { cookie } });
    await server.inject({ method: "POST", url: "/cafes", payload: { ...addCafePayload, name: "Espresso Spot", category: "Espresso" }, headers: { cookie } });
    const res = await server.inject({ method: "GET", url: "/cafes/category/Latte", headers: { cookie } });
    assert.strictEqual(res.statusCode, 200);
    assert.include(res.payload, "Latte Spot");
    assert.notInclude(res.payload, "Espresso Spot");
  });

  test("POST /cafes normalises preset categories to canonical casing", async () => {
    const cookie = await getAuthCookie();
    await server.inject({
      method: "POST",
      url: "/cafes",
      payload: { ...addCafePayload, name: "Casing Cafe", category: "coffee" },
      headers: { cookie },
    });
    const all = await db.cafeStore.getAllCafes();
    const target = all.find((c: any) => c.name === "Casing Cafe");
    assert.exists(target);
    assert.strictEqual(target.category, "Coffee");
  });

  test("POST /cafes preserves casing for custom (non-preset) categories", async () => {
    const cookie = await getAuthCookie();
    await server.inject({
      method: "POST",
      url: "/cafes",
      payload: { ...addCafePayload, name: "Vegan Cafe", category: "Vegan Bakery" },
      headers: { cookie },
    });
    const all = await db.cafeStore.getAllCafes();
    const target = all.find((c: any) => c.name === "Vegan Cafe");
    assert.exists(target);
    assert.strictEqual(target.category, "Vegan Bakery");
  });

  test("GET /dashboard renders the cafe-map div + JSON data block", async () => {
    const cookie = await getAuthCookie();
    const res = await server.inject({ method: "GET", url: "/dashboard", headers: { cookie } });
    assert.strictEqual(res.statusCode, 200);
    assert.include(res.payload, 'id="cafe-map"');
    assert.include(res.payload, 'id="cafe-map-data"');
    assert.include(res.payload, 'data-mode="picker"');
  });

  test("GET /cafes/:id renders the cafe-map partial in detail mode", async () => {
    const cookie = await getAuthCookie();
    await server.inject({ method: "POST", url: "/cafes", payload: { ...addCafePayload, name: "Detail Map Cafe" }, headers: { cookie } });
    const all = await db.cafeStore.getAllCafes();
    const target = all.find((c: any) => c.name === "Detail Map Cafe");
    const res = await server.inject({ method: "GET", url: `/cafes/${target._id}`, headers: { cookie } });
    assert.strictEqual(res.statusCode, 200);
    assert.include(res.payload, 'data-mode="detail"');
  });
});
