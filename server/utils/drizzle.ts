export { sql, eq, and, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../database/schema";
import pg from "pg";
const { Client } = pg;

const client = new Client();
client.connect();

export const tables = schema;
export type User = typeof schema.users.$inferSelect;
export const db = drizzle(client);
