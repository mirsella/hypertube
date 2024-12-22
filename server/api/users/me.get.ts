import { getToken, getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const token = await getToken({ event });
  if (!session || !token?.email) throw createError({ statusCode: 401 });

  const [user] = await db
    .select()
    .from(tables.users)
    .where(eq(tables.users.email, token.email));
  return user;
});
