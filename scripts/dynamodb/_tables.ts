// Cheapest viable schema: PAY_PER_REQUEST, no GSIs, default encryption. Add GSIs only when scans start to hurt.

export const TABLE_PREFIX = "beanmap-";

export const tables = [
  { name: `${TABLE_PREFIX}users`, pk: { name: "_id", type: "S" } },
  { name: `${TABLE_PREFIX}cafes`, pk: { name: "_id", type: "S" } },
  { name: `${TABLE_PREFIX}categories`, pk: { name: "name", type: "S" } },
];
