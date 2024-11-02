import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/database/schema.ts",

  dbCredentials: {
    user: "postgres",
    password: process.env.PGPASSWORD,
    host: "postgres", 
    database: "postgres",
    ssl: false,
  },
});
