// * api/user/modify/mail.ts
import { getServerSession } from "#auth";
import { getToken } from "#auth";
	
async function check_providers(username: string) {
	const user = (await db.select().from(tables.users).where(eq(tables.users.username, username)).limit(1))[0];
	if (!user) {
		return false;
	}
	const providers = await db.select().from(tables.providers).where(eq(tables.providers.email, user.email));
	const providerNames = providers.map(p => p.provider); // get providers name only

	if (providerNames.includes("github") || providerNames.includes("google") || providerNames.includes("42-school")) {
		return true;
	}
	return false;
}

async function check_mail(email: string) {
	const user = (await db.select().from(tables.users).where(eq(tables.users.email, email)).limit(1))[0];
	return Boolean(user);
}

export default defineEventHandler(async event => {
	const session = await getServerSession(event);
	const token = await getToken({ event });

	if (!session) {
		return { message: "User is not authenticated", status: 400 };
	}

	if (!token || !token.email) {
		return new Response("Unauthorized", { status: 401 });
	}
	const { username, email } = await readBody(event);

	if (!username || !email) {
		return { message: "Missing required fields", status: 400 };
	}
	if ((await check_providers(username)) === true) {
		// if he has github, google or 42 provider we don’t allow him to change his mail
		return { message: "You can't change your mail", status: 400 };
	}

	if ((await check_mail(email)) === true) {
		return { message: "Email already taken", status: 400 };
	}

	const updateResult = await db.update(tables.users).set({ email: email }).where(eq(tables.users.username, username));

	if (!updateResult) {
		return { message: "User not found", status: 404 };
	}

	const user = (await db.select().from(tables.users).where(eq(tables.users.username, username)).limit(1))[0];
	if (!user) {
		return { message: "User not found after update", status: 404 };
	}

	const providerUpdateResult = await db.update(tables.providers)
		.set({ email: email })  
		.where(eq(tables.providers.user_id, user.id));  

	if (!providerUpdateResult) {
		return { message: "Failed to update provider email", status: 500 };
	}

	return {
		email: email,
		message: "Your mail has been changed successfully",
		status: 200,
	};
});
