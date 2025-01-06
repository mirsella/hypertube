import { getServerSession, getToken } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const token = await getToken({ event });
  if (!session || !token?.email) throw createError({ statusCode: 401 });

  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  if (!id || !body?.content) throw createError({ statusCode: 400 });
  const headers = getRequestHeaders(event) as HeadersInit;

  if (body.username) {
    await $fetch("/api/users/modify/username", { headers });
  }
  if (body.lastname) {
    await $fetch("/api/users/modify/lastname", { headers });
  }
  if (body.username) {
    await $fetch("/api/users/modify/username", { headers });
  }
  if (body.password) {
    $fetch("/api/users/modify/password", { headers });
  }
});
