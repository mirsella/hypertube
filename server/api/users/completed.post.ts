// * api/user/completed.post.ts
import { getServerSession } from "#auth";
import { getToken } from "#auth";

export default defineEventHandler(async (event) => {
  try {
    const session = await getServerSession(event);
    const token = await getToken({ event });
    if (!token || !token.email) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (!session) {
      return new Response("Not authenticated", { status: 400 });
    } else {
      console.log("api/user/info_profil.ts, session found", session);
    }

    const { email } = await readBody(event);

    if (!email) {
      throw createError({
        statusMessage: "Email is required",
        statusCode: 400,
      });
    }

    const user = (
      await db
        .select({
          complete_profile: tables.users.complete_profile,
        })
        .from(tables.users)
        .where(eq(tables.users.email, email))
        .limit(1)
    )[0];

    if (!user) {
      throw createError({
        statusMessage: "User not found",
        statusCode: 404,
      });
    }

    console.log(
      "api/user/info_profil.ts, user complete profil ======================= ",
      user.complete_profile,
    );
    return {
      message: "Complete profile found",
      complete_profile: user.complete_profile,
      status: 200,
    };
  } catch (error) {
    return new Response("Error Auth", { status: 400 });
  }
});
