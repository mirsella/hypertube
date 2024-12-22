import { getServerSession, getToken } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const token = await getToken({ event });
  if (!session || !token?.email) throw createError({ statusCode: 401 });

  const id = getRouterParam(event, "id");
  const body: { content: string } = await readBody(event);
  if (!id || !body?.content) throw createError({ statusCode: 400 });

  const { commentid, userid } = (
    await db
      .select({ commentid: tables.comments.id, userid: tables.users.id })
      .from(tables.comments)
      .where(eq(tables.comments.id, id))
      .leftJoin(tables.users, eq(tables.users.id, tables.comments.authorId))
  )[0];
  if (!userid || commentid !== userid) throw createError({ statusCode: 403 });

  return await db
    .update(tables.comments)
    .set({ content: body.content })
    .where(eq(tables.comments.id, id))
    .returning();
});
