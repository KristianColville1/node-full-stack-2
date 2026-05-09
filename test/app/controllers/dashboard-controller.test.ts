import { before, suite, test } from "mocha";
import { assert } from "chai";
import { server } from "@/server.js";
import { initStores } from "@/core/data/db.js";
import { dashboardController } from "@/app/controllers/dashboard-controller.js";
import { countControllerEndpoints, assertControllerEndpointCount } from "../../helpers/controller-count.js";
import { signupPayload, loginPayload } from "../../fixtures/accounts.js";

const EXPECTED_ENDPOINT_COUNT = 1;

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

suite("Dashboard controller", () => {
  before(() => {
    initStores("memory");
  });

  test("endpoint count matches EXPECTED_ENDPOINT_COUNT (add/remove tests when controller changes)", () => {
    const actual = countControllerEndpoints(dashboardController as Record<string, unknown>);
    assertControllerEndpointCount(actual, EXPECTED_ENDPOINT_COUNT, "Dashboard", assert);
  });

  test("GET / without auth redirects to login", async () => {
    const res = await server.inject({ method: "GET", url: "/" });
    assert.strictEqual(res.statusCode, 302);
    assert.include(res.headers.location, "/login");
  });

  test("GET /dashboard with auth returns 200", async () => {
    const cookie = await getAuthCookie();
    const res = await server.inject({
      method: "GET",
      url: "/dashboard",
      headers: { cookie },
    });
    assert.strictEqual(res.statusCode, 200);
  });
});
