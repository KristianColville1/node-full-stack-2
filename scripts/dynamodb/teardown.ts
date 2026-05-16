import { DeleteTableCommand } from "@aws-sdk/client-dynamodb";
import { buildClient, describeTarget } from "./_client.js";
import { tableExists } from "./_helpers.js";
import { tables } from "./_tables.js";

async function main() {
  // Refuse without explicit confirmation — drops live tables.
  if (!process.argv.includes("--yes")) {
    console.error("Refusing to drop tables without --yes flag.");
    console.error("Run with `npm run db:teardown -- --yes` to confirm.");
    process.exit(2);
  }

  const target = buildClient();
  console.log(`DynamoDB teardown → ${describeTarget(target)}`);

  const results = await Promise.all(
    tables.map(async (table) => {
      const exists = await tableExists(target.client, table.name);
      if (!exists) return { name: table.name, status: "missing" };
      await target.client.send(new DeleteTableCommand({ TableName: table.name }));
      return { name: table.name, status: "deleted" };
    }),
  );

  results.forEach((r) => console.log(`  ${r.status.padEnd(8)} ${r.name}`));
  console.log("Done.");
}

main().catch((err) => {
  console.error("teardown failed:", err.message ?? err);
  process.exit(1);
});
