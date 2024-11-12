import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 64 }).notNull().unique(),
});

export const comments = pgTable("comments", {
  id: uuid().primaryKey().defaultRandom(),
  updated_at: timestamp({ withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
  content: varchar({ length: 1024 }).notNull(),
  movie_id: varchar({ length: 128 }).notNull(),
  authorId: uuid().references(() => users.id, { onDelete: "set null" }),
});
