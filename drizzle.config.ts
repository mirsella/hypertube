import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./server/database/schema.ts",
  // we don't need migration for this project
  // out: "./server/database/migrations",
  dbCredentials: {
    url: "sqlite.db",
  },
});
