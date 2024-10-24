import cuid2 from "@paralleldrive/cuid2";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";


export const users = sqliteTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => cuid2.createId()),
	email: text("email").notNull().unique(),
	username: text("username").notNull().unique(),
	lastname: text("lastname").notNull(),
	firstname: text("firstname").notNull(),
	password: text("password"),
	profile_picture: text("profile_picture").default("images/default-profil.png"),
	language: text("language").default("en"),
	resetToken: text("resetToken"),
	resetExpirationToken: text('resetExpirationToken'),
	complete_profile: text("complete_profile").default("false"),
	// TODO: add more columns as needed
});

export const usersRelations = relations(users, ({ many }) => ({
	providers: many(providers),
}));

export const providers = sqliteTable("providers", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => cuid2.createId()),
	email: text("email").notNull(),
	provider: text("provider").notNull(),
	user_id: text("user_id").notNull(),
});

export const providersRelations = relations(providers, ({ one }) => ({
	user: one(users, {
		fields: [providers.user_id],
		references: [users.id],
	}),
}));

