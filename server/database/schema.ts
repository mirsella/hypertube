import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
});

// NOTE: example. i dont think we have to use a movies table, as we can directly use the filesystem,
// and store the files with the <title as base64>.mp4, and just do a fs.stat to check if the file is downloaded
// and check for the files fs metadata like last accessed time for last viewed (to delete movies not viewed for a month)
// export const movies = pgTable("movies", {
//   id: serial("id").primaryKey(),
//   last_watched: timestamp("last_watched")
//     .notNull()
//     .defaultNow()
//     .$onUpdate(() => new Date()),
// });
