import { after, before, suite, test } from "mocha";
import { assert } from "chai";
import { server, start } from "@/server.js";

const EXPECTED_PLUGINS = ["@hapi/inert", "@hapi/vision", "@hapi/cookie", "hapi-auth-jwt2", "hapi-swagger"] as const;

suite("Core - middleware", () => {
  before(async () => {
    await start();
  });

  after(async () => {
    await server.stop();
  });

  test("server has registrations object", () => {
    assert.exists(server.registrations);
    assert.isObject(server.registrations);
  });

  test("each expected middleware plugin is registered", () => {
    EXPECTED_PLUGINS.forEach((name) => {
      assert.property(
        server.registrations,
        name,
        `middleware plugin "${name}" should be registered on server`,
      );
    });
  });

  test("no expected middleware is missing", () => {
    const registered = Object.keys(server.registrations);
    EXPECTED_PLUGINS.forEach((name) => {
      assert.include(
        registered,
        name,
        `server.registrations should include "${name}"`,
      );
    });
  });
});
