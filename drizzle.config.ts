import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./server/database/schema.ts",
    // we don't need migration for this project
    // out: "./server/database/migrations",

    dbCredentials: {
        user: "postgres",
        password: process.env.PGPASSWORD,
        host: "localhost",
        database: "postgres",
        ssl: false,
    },
});
