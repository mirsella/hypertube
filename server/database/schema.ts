import cuid2 from "@paralleldrive/cuid2";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid2.createId()),
  name: text("name").notNull().unique(),
  // TODO: add more columns as needed
});
