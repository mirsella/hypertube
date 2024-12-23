// * api/auth/reset-password.ts
import bcrypt from "bcrypt";

async function verification_token(token: string) {
    const user = await db.select().from(tables.users).where(eq(tables.users.resetToken, token));

    if (!user || user.length === 0) {
        return { message: `Invalid token`, status: 400, user: null };
    }

    const user_check = user[0];

    if (!user_check.resetExpirationToken) {
        return { message: `Invalid token`, status: 400, user: null };
    }

    const tokenExpiration = new Date(user_check.resetExpirationToken);
    const now = new Date();

    if (tokenExpiration < now) {
        return { message: `Token has expired`, status: 400, user: null };
    }

    return { message: `Token is valid`, status: 200, user: user_check };
}

async function same_password(password: string, user: any) {
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
        return true;
    } else {
        return false;
    }
}

export default defineEventHandler(async (event) => {
    const { password, token } = await readBody(event);

    if (!password || !token) {
        return new Response("Missing required fields", { status: 400 });
    }
    // console.log("api/auth/reset-password.ts, has been called ", { password, token });
    const result = await verification_token(token);

    if (result.status !== 200) {
        // console.log("Bad token");
        return new Response(result.message, { status: result.status });
    }

    const user = result.user;

    if ((await same_password(password, user)) === true) {
        // console.log("Password can't be the same");
        return new Response("You have the same password as before", { status: 400 });
    }

    const hashed_password = await bcrypt.hash(password, 10);

    await db
        .update(tables.users)
        .set({ password: hashed_password, resetToken: null, resetExpirationToken: null })
        .where(eq(tables.users.resetToken, token));

    // console.log("Mdp has been changed");
    return new Response("Password has been reset", { status: 200 });
});
