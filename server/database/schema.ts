import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 64 }).notNull().unique(),
});

export const usersRelations = relations(users, ({ many }) => ({
  comments: many(comments),
}));

export const comments = pgTable("comments", {
  id: uuid().primaryKey().defaultRandom(),
  content: varchar({ length: 1024 }),
  movie_id: varchar({ length: 1024 }),
  authorId: uuid(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));
