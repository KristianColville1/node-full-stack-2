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
});
