import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session) throw createError({ statusCode: 401 });

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });
  return await db
    .select()
    .from(tables.comments)
    .where(eq(tables.comments.movie_id, id))
    .orderBy(desc(tables.comments.updated_at))
    .leftJoin(tables.users, eq(tables.comments.authorId, tables.users.id));
});
