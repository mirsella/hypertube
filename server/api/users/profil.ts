// * api/user/profil.ts
import { getServerSession } from "#auth";

export default defineEventHandler(async event => {
	try {
		const session = await getServerSession(event);
		if (!session) {
			return new Response("Not authenticated", { status: 400 });
		}

		const { email } = await readBody(event);

		if (!email) {
			throw createError({
				statusMessage: "Email is required",
				statusCode: 400,
			});
		}

		const user = (await db
			.select({
				email: tables.users.email,
				firstname: tables.users.firstname,
				lastname: tables.users.lastname,
				username: tables.users.username,
				picture: tables.users.profile_picture,
			})
			.from(tables.users)
			.where(eq(tables.users.email, email))
			.limit(1))[0];

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
			.where(eq(tables.providers.email, user.email));

		const providerNames = providers.map(p => p.provider); // get providers name only

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
