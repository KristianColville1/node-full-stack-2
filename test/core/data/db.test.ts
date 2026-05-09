import { suite, test } from "mocha";
import { assert } from "chai";
import { db, initStores } from "@/core/data/db.js";

suite("Core - db", () => {
  test("db module exports an object", () => {
    assert.isObject(db);
  });

  test("db has userStore and cafeStore", () => {
    assert.property(db, "userStore");
    assert.property(db, "cafeStore");
  });

  test("initStores() assigns memory stores by default", () => {
    initStores("memory");
    assert.exists(db.userStore);
    assert.exists(db.cafeStore);
    assert.isFunction(db.userStore.addUser);
    assert.isFunction(db.userStore.getUserByEmail);
    assert.isFunction(db.userStore.getUserById);
    assert.isFunction(db.cafeStore.addCafe);
    assert.isFunction(db.cafeStore.getAllCafes);
    assert.isFunction(db.cafeStore.getByCategory);
  });

  test("userStore.addUser and getUserByEmail work", async () => {
    initStores("memory");
    await db.userStore.addUser({ email: "a@b.com", password: "secret" });
    const user = await db.userStore.getUserByEmail("a@b.com");
    assert.exists(user);
    assert.strictEqual(user?.email, "a@b.com");
    assert.strictEqual(user?.password, "secret");
  });

  test("initStores('json') assigns json stores", () => {
    initStores("json");
    assert.exists(db.userStore);
    assert.exists(db.cafeStore);
    assert.isFunction(db.userStore.addUser);
    assert.isFunction(db.userStore.getUserByEmail);
    assert.isFunction(db.userStore.getUserById);
    assert.isFunction(db.cafeStore.addCafe);
    assert.isFunction(db.cafeStore.getAllCafes);
    assert.isFunction(db.cafeStore.getByCategory);
  });

  test("json userStore addUser and getUserByEmail work", async () => {
    initStores("json");
    await db.userStore.addUser({ email: "json@test.com", password: "secret" });
    const user = await db.userStore.getUserByEmail("json@test.com");
    assert.exists(user);
    assert.strictEqual(user?.email, "json@test.com");
  });

  test("cafeStore CRUD and getByCategory work", async () => {
    initStores("memory");
    await db.cafeStore.addCafe({
      name: "Test Cafe",
      category: "Specialty",
      description: "A test",
    });
    const all = await db.cafeStore.getAllCafes();
    assert.lengthOf(all, 1);
    assert.strictEqual(all[0].name, "Test Cafe");
    assert.strictEqual(all[0].category, "Specialty");
    const byCat = await db.cafeStore.getByCategory("Specialty");
    assert.lengthOf(byCat, 1);
  });
});
