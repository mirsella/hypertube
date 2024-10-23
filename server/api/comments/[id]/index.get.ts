export default defineEventHandler(async (event): Promise<Comment> => {
  // TODO: check auth
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });
  const comment = await db
    .select()
    .from(tables.comments)
    .where(eq(tables.comments.id, id))
    .limit(1);
  return comment[0];
});
