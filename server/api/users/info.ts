// * api/user/info_profil.ts
import { getServerSession } from "#auth";

export default defineEventHandler(async event => {
	try {
		const session = await getServerSession(event);
		if (!session) {
			console.log("api/user/info_profil.ts, session not found");
		} else {
			console.log("api/user/info_profil.ts, session found", session);
		}
		// @ts-ignore
		const { email } = await readBody(event);

		console.log("api/user/info_profil.ts, has been called ", { email });

		if (!email) {
			throw createError({
				statusMessage: "Email is required",
				statusCode: 400,
			});
		}

		const user = await db
			.select({
				email: tables.users.email,
				firstname: tables.users.firstname,
				lastname: tables.users.lastname,
				username: tables.users.username,
			})
			.from(tables.users)
			.where(eq(tables.users.email, email))
			.get();

		if (!user) {
			throw createError({
				statusMessage: "User not found",
				statusCode: 404,
			});
		}

		const providers = await db
			.select({
				provider: tables.providers.provider,
			})
			.from(tables.providers)
			.where(eq(tables.providers.email, user.email))
			.all();

		const providerNames = providers.map(p => p.provider); // get providers name only

		console.log("Providers of the users found", providers);
		console.log("User found", user);

		return {
			message: "User found",
			user: user,
			providers: providerNames,
			status: 200,
		};
	} catch (error) {
		return new Response("Error Auth", { status: 400 });
	}
});
