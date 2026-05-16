import { DescribeTableCommand, ResourceNotFoundException } from "@aws-sdk/client-dynamodb";

// Idempotent existence check — swallows "not found" into a boolean.
export async function tableExists(client, name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch (err) {
    if (err instanceof ResourceNotFoundException) return false;
    throw err;
  }
}

// Same shape but returns the Table metadata when present — for list output.
export async function describeOrNull(client, name) {
  try {
    const out = await client.send(new DescribeTableCommand({ TableName: name }));
    return out.Table;
  } catch (err) {
    if (err instanceof ResourceNotFoundException) return null;
    throw err;
  }
}
