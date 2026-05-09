import { after, before, suite, test } from "mocha";
import { assert } from "chai";
import axios from "axios";
import { server, start } from "@/server.js";

suite("Public assets", () => {
  before(async () => {
    await start();
  });

  after(async () => {
    server.stop();
  });

  test("GET /assets/css/app.css returns 200 and CSS content", async () => {
    const url = `http://127.0.0.1:${server.info.port}/assets/css/app.css`;
    const res = await axios.get(url);
    assert.strictEqual(res.status, 200);
    assert.include(res.data, "Main app styles");
  });

  test("GET /assets/js/app.js returns 200 and JS content", async () => {
    const url = `http://127.0.0.1:${server.info.port}/assets/js/app.js`;
    const res = await axios.get(url);
    assert.strictEqual(res.status, 200);
    assert.include(res.data, "App script");
  });
});
