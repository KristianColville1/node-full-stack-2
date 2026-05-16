import dotenv from "dotenv";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

/**
 * Parse + validate AWS env into a plain object.
 *
 * Pure — pass an explicit env in tests so process.env isn't touched. The
 * `mode` field is derived: presence of DYNAMODB_ENDPOINT means local Dynamo
 * (container), absence means real AWS.
 */
export function readEnv(env = process.env) {
  const endpoint = env.DYNAMODB_ENDPOINT?.trim() || undefined;
  const region = env.AWS_REGION?.trim();
  const accessKeyId = env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!region) {
    throw new Error("AWS_REGION is required in .env (e.g. eu-west-1).");
  }
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required in .env.");
  }
  if (!endpoint && region === "local") {
    throw new Error("AWS_REGION=local is only valid with DYNAMODB_ENDPOINT set. Use a real AWS region for prod.");
  }

  return {
    endpoint,
    region,
    accessKeyId,
    secretAccessKey,
    mode: endpoint ? "local" : "aws",
  };
}

/** Build a DynamoDBClient from .env. dotenv side-effect lives here, not at import time. */
export function buildClient() {
  dotenv.config();
  const env = readEnv();
  const client = new DynamoDBClient({
    region: env.region,
    endpoint: env.endpoint,
    credentials: { accessKeyId: env.accessKeyId, secretAccessKey: env.secretAccessKey },
  });
  return { client, mode: env.mode, region: env.region, endpoint: env.endpoint };
}

export function describeTarget({ mode, region, endpoint }) {
  return mode === "local"
    ? `local DynamoDB at ${endpoint} (region=${region})`
    : `AWS DynamoDB in ${region}`;
}
