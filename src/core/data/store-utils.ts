import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import * as fs from "fs";
import path from "path";

/**
 * Initializes and returns a LowDB store for the given name.
 * Creates the directory and file if they do not exist.
 *
 * `baseDir` lets tests redirect file writes to a temp directory so they don't
 * pollute the project's `data/` folder. In production / dev it defaults to
 * `<cwd>/data`.
 *
 * @param {string} name - The name of the data to store (used as filename and key).
 * @param {string} [baseDir] - Optional override for the data directory.
 * @returns {Low} The initialized LowDB instance.
 */
export function initStore(name, baseDir) {
  const dir = baseDir ?? path.join(process.cwd(), "data");
  const filePath = path.join(dir, `${name}.json`);
  const store = {
    file: filePath,
    [name]: [],
  };
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(store.file)) {
    fs.writeFileSync(store.file, JSON.stringify(store));
  }
  const db = new Low<Record<string, any[]>>(new JSONFile(store.file), store as any);
  return db;
}
