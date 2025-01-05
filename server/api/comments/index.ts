import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session) throw createError({ statusCode: 401 });

  if (process.env.NODE_ENV === "production" && process.env.CI) {
    return [];
  }

  return db
    .select()
    .from(tables.comments)
    .orderBy(desc(tables.comments.updated_at))
    .leftJoin(tables.users, eq(tables.comments.authorId, tables.users.id));
});
