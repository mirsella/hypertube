export default defineEventHandler(async (event) => {
  // TODO: check auth
  const body = await readBody<{ content: string }>(event, {
    strict: true,
  });
  const id = getRouterParam(event, "id");
  if (!body?.content || !id) throw createError({ statusCode: 400 });
  return await db
    .insert(tables.comments)
    // TODO: add user id from auth
    .values({ content: body.content, movie_id: id })
    .returning();
});
