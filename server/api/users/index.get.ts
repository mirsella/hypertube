// * api/users.ts
import { getServerSession, getToken } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const token = await getToken({ event });
  if (!token || !token.email) {
    return { message: "Unauthorized", status: 401 };
  }

  if (!session) {
    return { message: "User is not authenticated", status: 400 };
  }

  const users = await db
    .select()
    .from(tables.users)
    .where(eq(tables.users.complete_profile, true));
  return { message: "Retrieve users successful", users }; // Retour sans `new Response`
});
