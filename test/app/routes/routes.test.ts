import { suite, test } from "mocha";
import { assert } from "chai";
import { routes } from "../../../src/app/routes/routes.js";

suite("Routes", () => {
  test("routes array has entries", () => {
    assert.isArray(routes);
    assert.isAtLeast(routes.length, 1);
  });

  test("each route has a method, path, and handler", () => {
    routes.forEach((route) => {
      assert.property(route, "method");
      assert.property(route, "path");
      const handler = route.handler ?? (route as any).config?.handler;
      assert.exists(handler, `route ${route.method} ${route.path} has no handler`);
      // Handler may be a function or a Hapi handler config (e.g. directory)
      assert.ok(typeof handler === "function" || typeof handler === "object", "handler must be function or object");
    });
  });

  test("GET / is registered", () => {
    const home = routes.find((r) => r.method === "GET" && r.path === "/");
    assert.exists(home);
    const handler = home?.handler ?? (home as any)?.config?.handler;
    assert.isFunction(handler);
  });

  test("GET /cafes is registered", () => {
    const cafes = routes.find((r) => r.method === "GET" && r.path === "/cafes");
    assert.exists(cafes);
    const handler = cafes?.handler ?? (cafes as any)?.config?.handler;
    assert.isFunction(handler);
  });

  test("GET /about is registered", () => {
    const about = routes.find((r) => r.method === "GET" && r.path === "/about");
    assert.exists(about);
    const handler = about?.handler ?? (about as any)?.config?.handler;
    assert.isFunction(handler);
  });

  test("signup and login routes are registered", () => {
    const getSignup = routes.find((r) => r.method === "GET" && r.path === "/signup");
    const postSignup = routes.find((r) => r.method === "POST" && r.path === "/signup");
    const getLogin = routes.find((r) => r.method === "GET" && r.path === "/login");
    const postLogin = routes.find((r) => r.method === "POST" && r.path === "/login");
    assert.exists(getSignup);
    assert.exists(postSignup);
    assert.exists(getLogin);
    assert.exists(postLogin);
  });
});
