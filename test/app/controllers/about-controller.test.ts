import { before, suite, test } from "mocha";
import { assert } from "chai";
import { server } from "@/server.js";
import { initStores } from "@/core/data/db.js";
import { aboutController } from "@/app/controllers/about-controller.js";
import { countControllerEndpoints, assertControllerEndpointCount } from "../../helpers/controller-count.js";

const EXPECTED_ENDPOINT_COUNT = 1;

suite("About controller", () => {
  before(() => {
    initStores("memory");
  });

  test("endpoint count matches EXPECTED_ENDPOINT_COUNT (add/remove tests when controller changes)", () => {
    const actual = countControllerEndpoints(aboutController as Record<string, unknown>);
    assertControllerEndpointCount(actual, EXPECTED_ENDPOINT_COUNT, "About", assert);
  });

  test("GET /about returns 200", async () => {
    const res = await server.inject({ method: "GET", url: "/about" });
    assert.strictEqual(res.statusCode, 200);
  });
});
