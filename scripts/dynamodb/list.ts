import {
  DescribeTableCommand,
  ListTablesCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";
import { buildClient, describeTarget } from "./_client.js";
import { tables } from "./_tables.js";

async function describeOrNull(client, name) {
  try {
    const out = await client.send(new DescribeTableCommand({ TableName: name }));
    return out.Table;
  } catch (err) {
    if (err instanceof ResourceNotFoundException) return null;
    throw err;
  }
}

async function main() {
  const target = buildClient();
  console.log(`DynamoDB list → ${describeTarget(target)}`);

  const all = await target.client.send(new ListTablesCommand({}));
  console.log(`  ${all.TableNames?.length ?? 0} total table(s) in this account/region.`);

  const ours = await Promise.all(
    tables.map(async (t) => {
      const meta = await describeOrNull(target.client, t.name);
      return {
        name: t.name,
        status: meta?.TableStatus ?? "MISSING",
        items: meta?.ItemCount ?? 0,
        billing: meta?.BillingModeSummary?.BillingMode ?? "?",
      };
    }),
  );

  ours.forEach((r) =>
    console.log(`  ${r.status.padEnd(10)} ${r.name.padEnd(24)} items=${r.items}  billing=${r.billing}`),
  );
}

main().catch((err) => {
  console.error("list failed:", err.message ?? err);
  process.exit(1);
});
