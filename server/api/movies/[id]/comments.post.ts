import { getServerSession, getToken } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const token = await getToken({ event });
  if (!session || !token?.email) throw createError({ statusCode: 401 });

  const users = await db
    .select({ id: tables.users.id })
    .from(tables.users)
    .where(eq(tables.users.email, token.email));

  const body = await readBody<{ content: string }>(event, {
    strict: true,
  });
  const id = getRouterParam(event, "id");
  if (!body?.content || !id) throw createError({ statusCode: 400 });
  return await db
    .insert(tables.comments)
    .values({ content: body.content, movie_id: id, authorId: users[0].id })
    .returning();
});
