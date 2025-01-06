// * api/user/modify/username.ts
import { getServerSession } from "#auth";
import { getToken } from "#auth";
async function check_username(username: string, email: string) {
  const verif_username = (
    await db
      .select()
      .from(tables.users)
      .where(eq(tables.users.username, username))
      .limit(1)
  )[0];

  if (verif_username && verif_username.email !== email) {
    return true;
  }
  return false;
}

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const token = await getToken({ event });
  if (!token || !token.email) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!session) {
    return { message: "User is not authenticated", status: 400 };
  }

  const { username } = await readBody(event);
  const { email } = token;

  if (!username || !email) {
    return { message: "Missing required fields", status: 400 };
  }

  if ((await check_username(username, email)) === true) {
    return { message: "Username is already taken", status: 400 };
  }
  const currentUser = (
    await db
      .select()
      .from(tables.users)
      .where(eq(tables.users.email, email))
      .limit(1)
  )[0];
  if (!currentUser) {
    throw createError({
      statusMessage: "User not found",
      statusCode: 404,
    });
  }

  if (currentUser.username !== username) {
    await db
      .update(tables.users)
      .set({ username: username })
      .where(eq(tables.users.email, email));
  } else {
    return { message: "Username is the same as the current one", status: 400 };
  }

  return {
    username: username,
    message: "Username updated successfully",
    status: 200,
  };
});
