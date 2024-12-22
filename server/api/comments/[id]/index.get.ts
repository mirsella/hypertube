import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session) throw createError({ statusCode: 401 });

  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });
  const comment = await db
    .select()
    .from(tables.comments)
    .where(eq(tables.comments.id, id))
    .limit(1);
  return comment[0];
});
