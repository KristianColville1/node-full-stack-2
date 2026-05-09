import { before, suite, test } from "mocha";
import { assert } from "chai";
import { server } from "@/server.js";
import { initStores } from "@/core/data/db.js";
import { db } from "@/core/data/db.js";
import { cafeController } from "@/app/controllers/cafe-controller.js";
import { countControllerEndpoints, assertControllerEndpointCount } from "../../helpers/controller-count.js";
import { addCafePayload } from "../../fixtures/cafes.js";
import { signupPayload, loginPayload } from "../../fixtures/accounts.js";

const EXPECTED_ENDPOINT_COUNT = 3; // update when adding/removing endpoints; add a test for each

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
  before(() => {
    initStores("memory");
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
});
