// * api/user/completed.ts
import { getServerSession } from "#auth";

export default defineEventHandler(async event => {
	try {
		const session = await getServerSession(event);
		if (!session) {
			return new Response("Not authentified", { status: 400 });
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
				complete_profile: tables.users.complete_profile,
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

		console.log("api/user/completed.ts, complete_profile found", user);

		const complete_profile = user.complete_profile === "true" ? true : false; // convert to boolean

		return {
			message: "Complete profile found",
			complete_profile,
			status: 200,
		};
	} catch (error) {
		return new Response("Error Auth", { status: 400 });
	}
});
