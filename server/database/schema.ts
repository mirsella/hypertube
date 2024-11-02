import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

// Table `users`
export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	username: varchar("username", { length: 255 }).notNull().unique(),
	lastname: varchar("lastname", { length: 255 }).notNull(),
	firstname: varchar("firstname", { length: 255 }).notNull(),
	password: varchar("password", { length: 255 }),
	profile_picture: varchar("profile_picture", { length: 255 }).default("images/default-profil.png"),
	resetToken: varchar("resetToken", { length: 255 }),
	resetExpirationToken: timestamp("resetExpirationToken", { withTimezone: true }),
	complete_profile: boolean("complete_profile").default(false),
	// TODO: add more columns as needed
});

export const usersRelations = relations(users, ({ many }) => ({
	providers: many(providers),
}));

// Table `providers`
export const providers = pgTable("providers", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: varchar("email", { length: 255 }).notNull(),
	provider: varchar("provider", { length: 255 }).notNull(),
	user_id: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
});

export const providersRelations = relations(providers, ({ one }) => ({
	user: one(users, {
		fields: [providers.user_id],
		references: [users.id],
	}),
}));

export const comments = pgTable("comments", {
	id: uuid().primaryKey().defaultRandom(),
	content: varchar({ length: 1024 }).notNull(),
	movie_id: varchar({ length: 1024 }).notNull(),
	authorId: uuid().references(() => users.id, { onDelete: "set null" }),
  });
