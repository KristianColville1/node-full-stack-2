import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
  waitUntilTableExists,
} from "@aws-sdk/client-dynamodb";
import { buildClient, describeTarget } from "./_client.js";
import { tables } from "./_tables.js";

async function tableExists(client, name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch (err) {
    if (err instanceof ResourceNotFoundException) return false;
    throw err;
  }
}

async function createTable(client, table) {
  await client.send(
    new CreateTableCommand({
      TableName: table.name,
      AttributeDefinitions: [{ AttributeName: table.pk.name, AttributeType: table.pk.type }],
      KeySchema: [{ AttributeName: table.pk.name, KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
    }),
  );
  await waitUntilTableExists({ client, maxWaitTime: 60 }, { TableName: table.name });
}

async function main() {
  const target = buildClient();
  console.log(`DynamoDB setup → ${describeTarget(target)}`);

  const results = await Promise.all(
    tables.map(async (table) => {
      const exists = await tableExists(target.client, table.name);
      if (exists) return { name: table.name, status: "exists" };
      await createTable(target.client, table);
      return { name: table.name, status: "created" };
    }),
  );

  results.forEach((r) => console.log(`  ${r.status.padEnd(7)} ${r.name}`));
  console.log("Done.");
}

main().catch((err) => {
  console.error("setup failed:", err.message ?? err);
  process.exit(1);
});
