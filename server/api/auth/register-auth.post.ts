// api/auth/register.ts
// @ts-ignore
import bcrypt from "bcryptjs";

async function check_already_register(username: string, email: any) {
    const verif_mail = await db.select().from(tables.users).where(eq(tables.users.email, email));

    if (verif_mail.length > 0) {
        const providers_exist = await db
            .select({
                email: tables.providers.email,
                provider: tables.providers.provider,
            })
            .from(tables.providers)
            .where(eq(tables.providers.email, email))
            .limit(1)
            .then((results) => results[0]);

        if (!providers_exist) {
            return { message: "Email already used", status: 400 };
        }
        return {
            message: `You are already registered with this email with ${providers_exist.provider}`,
            status: 400,
        };
    }

    const verif_username = await db
        .select()
        .from(tables.users)
        .where(eq(tables.users.username, username));

    if (verif_username.length > 0) {
        return { message: "Username already used", status: 400 };
    }
    return 0;
}

// Credentials way
export default defineEventHandler(async (event) => {
    const { username, email, lastname, firstname, password } = await readBody(event);

    if (!username || !email || !lastname || !firstname || !password) {
        return { message: "Missing required fields", status: 400 };
    }

    const check = await check_already_register(username, email);
    if (check !== 0) {
        return { message: check.message, status: check.status };
    }

    const hashed_password = await bcrypt.hash(password, 10);

    try {
        await db.insert(tables.users).values({
            username,
            email,
            lastname,
            firstname,
            password: hashed_password,
            complete_profile: true,
        });

        const user = await db
            .select()
            .from(tables.users)
            .where(eq(tables.users.username, username))
            .limit(1)
            .then((results) => results[0]);

        if (user) {
            await db.insert(tables.providers).values({
                email: email,
                provider: "credentials",
                user_id: user.id,
            });
        }
    } catch (error) {
        console.error("Error while creating user", error);
        return { message: "An error occurred", status: 400 };
    }

    return { message: "User created", status: 200 };
});
