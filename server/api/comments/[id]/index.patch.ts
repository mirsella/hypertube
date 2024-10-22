export default defineEventHandler(async (event) => {
  // TODO: check auth, and user is author of comment
  const id = getRouterParam(event, "id");
  const body: { content: string } = await readBody(event);
  if (!id || !body?.content) throw createError({ statusCode: 400 });
  return await db
    .update(tables.comments)
    .set({ content: body.content })
    .where(eq(tables.comments.id, id))
    .returning();
});
