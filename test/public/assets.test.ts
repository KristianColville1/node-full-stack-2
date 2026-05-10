import { suite, test } from "mocha";
import { assert } from "chai";
import { server } from "@/server.js";

suite("Public assets", () => {
  test("GET /assets/css/app.css returns 200 and CSS content", async () => {
    const res = await server.inject({ method: "GET", url: "/assets/css/app.css" });
    assert.strictEqual(res.statusCode, 200);
    assert.include(res.payload, "Main app styles");
  });

  test("GET /assets/js/app.js returns 200 and JS content", async () => {
    const res = await server.inject({ method: "GET", url: "/assets/js/app.js" });
    assert.strictEqual(res.statusCode, 200);
    assert.include(res.payload, "App script");
  });

  test("GET /assets/js/cafe-map.js returns 200 and JS content", async () => {
    const res = await server.inject({ method: "GET", url: "/assets/js/cafe-map.js" });
    assert.strictEqual(res.statusCode, 200);
    assert.include(res.payload, "Cafe map glue");
  });
});
