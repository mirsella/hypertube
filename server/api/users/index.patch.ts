import { getServerSession, getToken } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const token = await getToken({ event });
  if (!session || !token?.email) throw createError({ statusCode: 401 });

  const body = await readBody(event);
  const headers = getRequestHeaders(event) as HeadersInit;

  if (body?.username) {
    await $fetch("/api/users/modify/username", {
      headers,
      body,
      method: "POST",
    });
  }
  if (body?.lastname && body?.firstname) {
    await $fetch("/api/users/modify/name", {
      headers,
      body,
      method: "POST",
    });
  }
  if (body?.picture_profil) {
    await $fetch("/api/users/modify/username", {
      headers,
      body,
      method: "POST",
    });
  }
  if (body?.password) {
    await $fetch("/api/users/modify/password", {
      headers,
      body,
      method: "POST",
    });
  }
  return { message: "Data has been updated", status: 200 };
});
