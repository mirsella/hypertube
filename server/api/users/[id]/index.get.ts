import { getToken, getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event);
    const token = await getToken({ event });
    if (!session || !token?.email) throw createError({ statusCode: 401 });

    const id = getRouterParam(event, "id");
    if (!id) throw createError({ statusCode: 400, statusMessage: "id required" });
    const [user] = await db
        .select()
        .from(tables.users)
        .where(eq(tables.users.id, id));
    return user;
});