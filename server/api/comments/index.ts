export default defineEventHandler(async (event) => {
  return db
    .select()
    .from(tables.comments)
    .orderBy(desc(tables.comments.updated_at))
    .leftJoin(tables.users, eq(tables.comments.authorId, tables.users.id));
});
