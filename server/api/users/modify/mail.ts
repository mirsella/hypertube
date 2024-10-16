// * api/user/modify/mail.ts
import { getServerSession } from "#auth";

async function check_providers(username: string) {
	const user = await db.select().from(tables.users).where(eq(tables.users.username, username)).get();
	if (!user) {
		return false;
	}
	const providers = await db.select().from(tables.providers).where(eq(tables.providers.email, user.email)).all();
	const providerNames = providers.map(p => p.provider); // get providers name only

	if (providerNames.includes("github") || providerNames.includes("google") || providerNames.includes("fortytwo")) {
		return true;
	}
	return false;
}
async function check_mail(email: string) {
	const user = await db.select().from(tables.users).where(eq(tables.users.email, email)).get();
	if (!user) {
		return false;
	}
	return true;
}

export default defineEventHandler(async event => {
	const session = await getServerSession(event);

	if (!session) {
		return { message: "User is not authenticated", status: 400 };
	}

	const { username, email } = await readBody(event);

	if (!username || !email) {
		return { message: "Missing required fields", status: 400 };
	}
	if ((await check_providers(username)) === true) {
		// if he has github, google or fortytwo provider we dont allow him to change his mail
		return { message: "You can't change your mail", status: 400 };
	}

	if ((await check_mail(email)) === true) {
		return { message: "Email already taken", status: 400 };
	}

	const user = await db.update(tables.users).set({ email: email }).where(eq(tables.users.username, username));

	if (!user) {
		return { message: "User not found", status: 404 };
	
    }
	// await updateSession(event, { email });
    // ! VERY IMPORTANT UPDATE LA SESSION

	return {
		message: "Your mail has been changed successfully",
		status: 200,
	};
});
