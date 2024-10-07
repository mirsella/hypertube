// * api/auth/finish-register.ts
import { getToken } from "#auth";

async function check_username(username: string) {
	const verif_username = await db.select().from(tables.users).where(eq(tables.users.username, username));

	if (verif_username.length > 0) {
		return { message: "Username already used", status: 400 };
	}
	return 0;
}

export default defineEventHandler(async event => {
	const { username, lastname, firstname } = await readBody(event);
	const token = await getToken({ event });

	console.log("token email ==== ", token?.email);
	if (!token || !token.email) {
		return new Response("Unauthorized", { status: 401 });
	}

	console.log("api/auth/register-auth.ts, has been called ", { username, lastname, firstname });
	if (!username || !lastname || !firstname) {
		return new Response("Missing required fields", { status: 400 });
	}

	const check = await check_username(username);

	if (check !== 0) {
		return new Response(check.message, { status: check.status });
	}

	const user = await db.select().from(tables.users).where(eq(tables.users.email, token.email)).get();

	if (!user) {
		return new Response("User not found", { status: 404 });
	}

	await db
		.update(tables.users)
		.set({
			username,
			lastname,
			firstname,
			complete_profile: "true",
		})
		.where(eq(tables.users.email, token.email));

	return new Response("Profil completed ", {
		status: 200,
	});
});
