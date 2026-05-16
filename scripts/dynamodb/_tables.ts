// Cheapest viable schema:
//   - PAY_PER_REQUEST so we only pay for what we use; no provisioned capacity.
//   - No GSIs — query patterns at this scale fit on full table scans.
//   - Default encryption (free); PITR / streams disabled.
//
// Add GSIs later if scan latency becomes a problem.

export const TABLE_PREFIX = "beanmap-";

export const tables = [
  {
    name: `${TABLE_PREFIX}users`,
    pk: { name: "_id", type: "S" },
  },
  {
    name: `${TABLE_PREFIX}cafes`,
    pk: { name: "_id", type: "S" },
  },
  {
    name: `${TABLE_PREFIX}categories`,
    pk: { name: "name", type: "S" },
  },
];
