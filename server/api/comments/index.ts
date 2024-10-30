export default defineEventHandler(async (event) => {
  return db
    .select()
    .from(tables.comments)
    .leftJoin(tables.users, eq(tables.comments.authorId, tables.users.id));
});
