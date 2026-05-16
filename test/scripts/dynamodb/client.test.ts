import { suite, test } from "mocha";
import { assert } from "chai";
import { readEnv, describeTarget } from "../../../scripts/dynamodb/_client.js";

suite("scripts/dynamodb/_client — readEnv", () => {
  test("rejects missing AWS_REGION", () => {
    assert.throws(
      () => readEnv({ AWS_ACCESS_KEY_ID: "k", AWS_SECRET_ACCESS_KEY: "s" }),
      /AWS_REGION/,
    );
  });

  test("rejects missing credentials", () => {
    assert.throws(
      () => readEnv({ AWS_REGION: "eu-west-1" }),
      /AWS_ACCESS_KEY_ID/,
    );
  });

  test("rejects AWS_REGION=local without DYNAMODB_ENDPOINT", () => {
    assert.throws(
      () => readEnv({
        AWS_REGION: "local",
        AWS_ACCESS_KEY_ID: "k",
        AWS_SECRET_ACCESS_KEY: "s",
      }),
      /AWS_REGION=local/,
    );
  });

  test("accepts AWS_REGION=local when DYNAMODB_ENDPOINT is set", () => {
    const env = readEnv({
      AWS_REGION: "local",
      AWS_ACCESS_KEY_ID: "k",
      AWS_SECRET_ACCESS_KEY: "s",
      DYNAMODB_ENDPOINT: "http://localhost:8000",
    });
    assert.equal(env.mode, "local");
    assert.equal(env.endpoint, "http://localhost:8000");
  });

  test("returns mode=aws and no endpoint for a real region", () => {
    const env = readEnv({
      AWS_REGION: "eu-west-1",
      AWS_ACCESS_KEY_ID: "k",
      AWS_SECRET_ACCESS_KEY: "s",
    });
    assert.equal(env.mode, "aws");
    assert.isUndefined(env.endpoint);
  });

  test("trims whitespace from values", () => {
    const env = readEnv({
      AWS_REGION: "  eu-west-1  ",
      AWS_ACCESS_KEY_ID: " k ",
      AWS_SECRET_ACCESS_KEY: " s ",
    });
    assert.equal(env.region, "eu-west-1");
    assert.equal(env.accessKeyId, "k");
  });
});

suite("scripts/dynamodb/_client — describeTarget", () => {
  test("local mode mentions the endpoint", () => {
    const out = describeTarget({ mode: "local", region: "local", endpoint: "http://localhost:8000" });
    assert.include(out, "local DynamoDB at http://localhost:8000");
  });

  test("aws mode mentions the region", () => {
    const out = describeTarget({ mode: "aws", region: "eu-west-1" });
    assert.equal(out, "AWS DynamoDB in eu-west-1");
  });
});
