import { suite, test } from "mocha";
import { assert } from "chai";
import { apiRoutes } from "@/app/api/api-routes.js";

suite("API routes", () => {
  test("api routes array has entries", () => {
    assert.isArray(apiRoutes);
    assert.isAtLeast(apiRoutes.length, 1);
  });

  test("each api route has method, path, and handler", () => {
    apiRoutes.forEach((route) => {
      assert.property(route, "method");
      assert.property(route, "path");
      const handler = route.handler ?? route.config?.handler;
      assert.exists(handler, `route ${route.method} ${route.path} has no handler`);
      assert.isFunction(handler);
    });
  });

  test("cafe CRUD routes are registered", () => {
    const list = apiRoutes.find((r) => r.method === "GET" && r.path === "/api/cafes");
    const getOne = apiRoutes.find((r) => r.method === "GET" && r.path === "/api/cafes/{id}");
    const create = apiRoutes.find((r) => r.method === "POST" && r.path === "/api/cafes");
    const update = apiRoutes.find((r) => r.method === "PUT" && r.path === "/api/cafes/{id}");
    const remove = apiRoutes.find((r) => r.method === "DELETE" && r.path === "/api/cafes/{id}");
    assert.exists(list);
    assert.exists(getOne);
    assert.exists(create);
    assert.exists(update);
    assert.exists(remove);
  });

  test("cafe getByCategory route is registered", () => {
    const byCategory = apiRoutes.find(
      (r) => r.method === "GET" && r.path === "/api/cafes/category/{category}",
    );
    assert.exists(byCategory);
  });

  test("user API routes are registered with handlers", () => {
    const createUser = apiRoutes.find((r) => r.method === "POST" && r.path === "/api/users");
    const authenticate = apiRoutes.find(
      (r) => r.method === "POST" && r.path === "/api/users/authenticate",
    );
    assert.exists(createUser);
    assert.exists(authenticate);
    const createHandler = createUser?.handler ?? createUser?.config?.handler;
    const authHandler = authenticate?.handler ?? authenticate?.config?.handler;
    assert.isFunction(createHandler, "POST /api/users has a handler");
    assert.isFunction(authHandler, "POST /api/users/authenticate has a handler");
  });
});
