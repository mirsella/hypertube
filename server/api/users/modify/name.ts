// * api/user/modify/name.ts
import { getServerSession } from "#auth";
import { getToken } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const token = await getToken({ event });

  if (!session) {
    return { message: "User is not authentificated", status: 400 };
  }

  if (!token || !token.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { firstname, lastname } = await readBody(event);
  const { email } = token;
  if (!firstname || !lastname || !email) {
    return { message: "Missing required fields", status: 400 };
  }
  // console.log("api/user/modify/name.ts, firstname, lastname, email", firstname, lastname, email);

  const user = await db
    .update(tables.users)
    .set({ firstname: firstname, lastname: lastname })
    .where(eq(tables.users.email, email));

  if (!user) {
    return { message: "User not found", status: 404 };
  }
  return {
    firstname: firstname,
    lastname: lastname,
    message: "Name updated successfully",
    status: 200,
  };
});
