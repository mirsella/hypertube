// * api/user/modify/username.ts
import { getServerSession } from "#auth";

async function check_username(username: string, email: string) {
	const verif_username = await db.select().from(tables.users).where(eq(tables.users.username, username)).get();

	if (verif_username && verif_username.email !== email) {
		return true;
	}
	return false;
}

export default defineEventHandler(async event => {
	const session = await getServerSession(event);

	if (!session) {
		return { message: "User is not authentificated", status: 400 };
	} else {
		console.log("api/user/info_profil.ts, session found", session);
	}

	const { username, email } = await readBody(event);

	if (!username || !email) {
		return { message: "Missing required fields", status: 400 };
	}
	console.log("api/user/modify/username.ts, username, email", username, email);
	if ((await check_username(username, email)) === true) {
		return { message: "Username is already taken", status: 400 };
	}
	console.log("api/user/modify/name.ts, firstname, lastname, email", username, email);
	const currentUser = await db.select().from(tables.users).where(eq(tables.users.email, email)).get();
	if (!currentUser) {
		throw createError({
			statusMessage: "User not found",
			statusCode: 404,
		});
	}

	if (currentUser.username !== username) {
		await db.update(tables.users).set({ username: username }).where(eq(tables.users.email, email));
	} else {
		return { message: "Username is the same as the current one", status: 400 };
	}

	return {
		username: username,
		message: "Name updated successfully",
		status: 200,
	};
});
