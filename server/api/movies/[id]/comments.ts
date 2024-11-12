export default defineEventHandler(async (event) => {
  // TODO: check auth
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });
  return await db
    .select()
    .from(tables.comments)
    .where(eq(tables.comments.movie_id, id))
    .orderBy(desc(tables.comments.updated_at))
    .leftJoin(tables.users, eq(tables.comments.authorId, tables.users.id));
});
