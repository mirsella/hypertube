// * api/auth/finish-register.ts
import { getToken } from "#auth";

async function check_username(username: string) {
    const verif_username = await db
        .select()
        .from(tables.users)
        .where(eq(tables.users.username, username));

    if (verif_username.length > 0) {
        return { message: "Username already used", status: 400 };
    }
    return 0;
}

export default defineEventHandler(async (event) => {
    const { username, lastname, firstname } = await readBody(event);
    const token = await getToken({ event });

    // Vérification de la présence du token et de l'email
    if (!token || !token.email) {
        return { message: "Unauthorized", status: 401 };
    }

    if (!username || !lastname || !firstname) {
        return { message: "Missing required fields", status: 400 };
    }

    const check = await check_username(username);

    if (check !== 0) {
        return { message: "Username already used", status: 400 };
    }

    const user = (
        await db.select().from(tables.users).where(eq(tables.users.email, token.email)).limit(1)
    )[0];

    if (!user) {
        return { message: "User not found", status: 404 };
    }

    await db
        .update(tables.users)
        .set({
            username,
            lastname,
            firstname,
            complete_profile: true,
        })
        .where(eq(tables.users.email, token.email));
    return { message: "User updated", status: 200 };
});

