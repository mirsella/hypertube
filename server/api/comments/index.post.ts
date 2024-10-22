export default defineEventHandler(async (event) => {
  // TODO: check auth
  const body = await readBody<{ content: string; movie_id: string }>(event, {
    strict: true,
  });
  if (!body?.content || !body?.movie_id) throw createError({ statusCode: 400 });
  return await db
    .insert(tables.comments)
    // TODO: add user id from auth
    .values({ content: body.content, movie_id: body.movie_id })
    .returning();
});
