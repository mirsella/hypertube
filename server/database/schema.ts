import { pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  last_watched: timestamp("last_watched")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
