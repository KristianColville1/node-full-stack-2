import dotenv from "dotenv";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

dotenv.config();

/**
 * Build a DynamoDBClient from env. Two modes:
 *  - Local mode: DYNAMODB_ENDPOINT is set (typically http://localhost:8000).
 *  - AWS mode: DYNAMODB_ENDPOINT is empty/missing — uses the real AWS endpoint
 *    derived from AWS_REGION.
 *
 * Throws a friendly error if required vars are missing or look wrong.
 */
export function buildClient() {
  const endpoint = process.env.DYNAMODB_ENDPOINT?.trim() || undefined;
  const region = process.env.AWS_REGION?.trim();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!region) {
    throw new Error("AWS_REGION is required in .env (e.g. eu-west-1).");
  }
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required in .env.");
  }
  if (!endpoint && region === "local") {
    throw new Error("AWS_REGION=local is only valid with DYNAMODB_ENDPOINT set. Use a real AWS region for prod.");
  }

  const mode = endpoint ? "local" : "aws";
  const client = new DynamoDBClient({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  return { client, mode, region, endpoint };
}

export function describeTarget({ mode, region, endpoint }) {
  return mode === "local"
    ? `local DynamoDB at ${endpoint} (region=${region})`
    : `AWS DynamoDB in ${region}`;
}
