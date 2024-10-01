export { sql, eq, and, or } from "drizzle-orm";

import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

import * as schema from "../database/schema";
export const tables = schema;

export type User = typeof schema.users.$inferSelect;

const sqlite = new Database("sqlite.db");
export const db: BetterSQLite3Database = drizzle(sqlite);
