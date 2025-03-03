import { getServerSession, getToken } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const token = await getToken({ event });
  if (!session || !token?.email) throw createError({ statusCode: 401 });

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });

  const { commentAuthor, userid } = (
    await db
      .select({
        commentAuthor: tables.comments.authorId,
        userid: tables.users.id,
      })
      .from(tables.comments)
      .where(eq(tables.comments.id, id))
      .leftJoin(tables.users, eq(tables.users.id, tables.comments.authorId))
  )[0];
  if (!userid || commentAuthor !== userid)
    throw createError({ statusCode: 403 });

  return await db
    .delete(tables.comments)
    .where(eq(tables.comments.id, id))
    .returning();
});
