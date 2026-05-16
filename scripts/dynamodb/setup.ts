import { CreateTableCommand, waitUntilTableExists } from "@aws-sdk/client-dynamodb";
import { buildClient, describeTarget } from "./_client.js";
import { tableExists } from "./_helpers.js";
import { tables } from "./_tables.js";

async function createTable(client, table) {
  await client.send(
    new CreateTableCommand({
      TableName: table.name,
      AttributeDefinitions: [{ AttributeName: table.pk.name, AttributeType: table.pk.type }],
      KeySchema: [{ AttributeName: table.pk.name, KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
    }),
  );
  // Block until ACTIVE so callers know writes will succeed immediately after.
  await waitUntilTableExists({ client, maxWaitTime: 60 }, { TableName: table.name });
}

async function main() {
  const target = buildClient();
  console.log(`DynamoDB setup → ${describeTarget(target)}`);

  // Idempotent: parallel-check then create only missing tables.
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
