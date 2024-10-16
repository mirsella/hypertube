// * api/user/modify/password.ts

import { getServerSession } from "#auth";
import bcrypt from "bcrypt";
async function check_providers(email: string) {
	const user = await db.select().from(tables.users).where(eq(tables.users.email, email)).get();
	if (!user) {
		return false;
	}
	const providers = await db.select().from(tables.providers).where(eq(tables.providers.email, email)).all();
	const providerNames = providers.map(p => p.provider); // get providers name only
	return providerNames.includes("credentials");
}

// Ajoute un provider 'credentials' à l'utilisateur
async function add_provider(email: string) {
    const user = await db.select().from(tables.users).where(eq(tables.users.email, email)).get();
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

export default defineEventHandler(async event => {
	const session = await getServerSession(event);

	if (!session) {
		return { message: "User is not authenticated", status: 400 };
	}

	const { password, email } = await readBody(event);

	if (!password || !email) {
		return { message: "Missing required fields", status: 400 };
	}

	console.log("api/user/modify/password.ts, password, email", password, email);

    const hasCredentials = await check_providers(email);
    if (!hasCredentials) { // if he doesnt have we have table providers credientials
        const addProviderResponse = await add_provider(email);
        console.log("he has no credentials, adding provider", addProviderResponse);
        if (addProviderResponse.status !== 200) {
            return addProviderResponse;
        }
    }

	const hashed_password = await bcrypt.hash(password, 10);

	const user = await db.update(tables.users).set({ password: hashed_password }).where(eq(tables.users.email, email)).returning();
	if (!user) {
		return { message: "User not found", status: 404 };
	}

	return {
		message: "Password has been updated successfully",
		status: 200,
	};
});