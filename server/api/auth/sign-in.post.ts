// * api/auth/sign-in.ts
// @ts-ignore
import bcrypt from "bcryptjs";

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event);

  if (!username || !password) {
    return new Response("Missing required fields", { status: 400 });
  }

  const user = (
    await db
      .select()
      .from(tables.users)
      .where(eq(tables.users.username, username))
      .limit(1)
  )[0];
  if (!user) {
    return new Response("Username not found", { status: 400 });
  }

  if (user.password === null) {
    return new Response("Invalid password", { status: 400 });
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (isPasswordMatch) {
    return new Response("Sign in successfully", { status: 200 });
  } else {
    return new Response("Invalid password", { status: 400 });
  }
});
