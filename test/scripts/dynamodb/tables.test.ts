import { suite, test } from "mocha";
import { assert } from "chai";
import { tables, TABLE_PREFIX } from "../../../scripts/dynamodb/_tables.js";

suite("scripts/dynamodb/_tables", () => {
  test("declares exactly the three project tables", () => {
    const names = tables.map((t) => t.name);
    assert.sameMembers(names, [
      `${TABLE_PREFIX}users`,
      `${TABLE_PREFIX}cafes`,
      `${TABLE_PREFIX}categories`,
    ]);
  });

  test("every table has a string-typed primary key", () => {
    tables.forEach((t) => {
      assert.equal(t.pk.type, "S");
      assert.isString(t.pk.name);
      assert.isAbove(t.pk.name.length, 0);
    });
  });

  test("prefix is non-empty so tables don't collide with other apps in the account", () => {
    assert.isAbove(TABLE_PREFIX.length, 0);
    tables.forEach((t) => assert.isTrue(t.name.startsWith(TABLE_PREFIX)));
  });
});
