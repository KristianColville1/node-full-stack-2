import { suite, test } from "mocha";
import { assert } from "chai";
import { server } from "@/server.js";

suite("Server", () => {
  test("middleware plugins are registered", () => {
    assert.exists(server.registrations);
  });

  test("views are configured with Handlebars", () => {
    assert.isFunction(server.getViewsManager);
    const manager = server.getViewsManager();
    assert.exists(manager);
    assert.isObject(manager);
  });

  test("server has validator configured", () => {
    assert.isFunction(server.validator);
  });

  test("auth default strategy is session", () => {
    const defaultAuth = server.auth.settings.default;
    assert.exists(defaultAuth, "auth default should be set");
    assert.strictEqual(defaultAuth.strategies?.[0], "session");
  });

  test("GET /documentation (Swagger UI) returns 200", async () => {
    const res = await server.inject({ method: "GET", url: "/documentation" });
    assert.strictEqual(res.statusCode, 200);
  });

  test("GET /swagger.json returns the OpenAPI document with cafe + user paths", async () => {
    const res = await server.inject({ method: "GET", url: "/swagger.json" });
    assert.strictEqual(res.statusCode, 200);
    const doc = JSON.parse(res.payload);
    assert.exists(doc.paths["/api/cafes"], "API doc should list /api/cafes");
    assert.exists(doc.paths["/api/users"], "API doc should list /api/users");
  });
});
