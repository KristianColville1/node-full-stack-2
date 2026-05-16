import { ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { buildClient, describeTarget } from "./_client.js";
import { describeOrNull } from "./_helpers.js";
import { tables } from "./_tables.js";

async function main() {
  const target = buildClient();
  console.log(`DynamoDB list → ${describeTarget(target)}`);

  // Account-wide table count first, then the rows we care about.
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
