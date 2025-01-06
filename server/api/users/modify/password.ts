// * api/user/modify/password.ts

import { getServerSession, getToken } from "#auth";
// @ts-ignore
import bcrypt from "bcryptjs";

async function check_providers(email: string) {
  const user = (
    await db
      .select()
      .from(tables.users)
      .where(eq(tables.users.email, email))
      .limit(1)
  )[0];
  if (!user) {
    return false;
  }
  const providers = await db
    .select()
    .from(tables.providers)
    .where(eq(tables.providers.email, email));
  const providerNames = providers.map((p) => p.provider); // get providers name only
  return providerNames.includes("credentials");
}

// Ajoute un provider 'credentials' à l'utilisateur
async function add_provider(email: string) {
  const user = (
    await db
      .select()
      .from(tables.users)
      .where(eq(tables.users.email, email))
      .limit(1)
  )[0];
  if (!user) {
    return { message: "User not found", status: 404 };
  }
  await db.insert(tables.providers).values({
    email: email,
    provider: "credentials",
    user_id: user.id,
  });
  return { message: "Provider added", status: 200 };
}

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const token = await getToken({ event });
  if (!session) {
    return { message: "User is not authenticated", status: 400 };
  }
  if (!token || !token.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { password } = await readBody(event);
  const { email } = token;

  if (!password || !email) {
    return { message: "Missing required fields", status: 400 };
  }

  const hasCredentials = await check_providers(email);
  if (!hasCredentials) {
    const addProviderResponse = await add_provider(email);
    if (addProviderResponse.status !== 200) {
      return addProviderResponse;
    }
  }

  const hashed_password = await bcrypt.hash(password, 10);

  const updateResult = await db
    .update(tables.users)
    .set({ password: hashed_password })
    .where(eq(tables.users.email, email));

  if (!updateResult) {
    return { message: "User not found", status: 404 };
  }

  return {
    message: "Password has been updated successfully",
    status: 200,
  };
});
