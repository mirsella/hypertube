export default defineEventHandler(async (event) => {
  // TODO: check auth, and user is author of comment
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });
  return await db
    .delete(tables.comments)
    .where(eq(tables.comments.id, id))
    .returning();
});
