export { sql, eq, and, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../database/schema";
import pg from "pg";
const { Client } = pg;

// NOTE: password is automatically used by node-postgres as its called PGPASSWORD
const client = new Client({ user: "postgres" });
client.connect();

export const tables = schema;
export type User = typeof schema.users.$inferSelect;
export const db = drizzle(client);
