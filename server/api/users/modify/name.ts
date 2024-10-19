// * api/user/modify/name.ts
import { getServerSession } from "#auth";

export default defineEventHandler(async event => {
	const session = await getServerSession(event);

	if (!session) {
		return { message: "User is not authentificated", status: 400 };
	} else {
		console.log("api/user/info_profil.ts, session found", session);
	}

	const { firstname, lastname, email } = await readBody(event);
	if (!firstname || !lastname || !email) {
		return { message: "Missing required fields", status: 400 };
	}
	console.log("api/user/modify/name.ts, firstname, lastname, email", firstname, lastname, email);

	const user = await db
		.update(tables.users)
		.set({ firstname: firstname, lastname: lastname })
		.where(eq(tables.users.email, email));

	if (!user) {
		return { message: "User not found", status: 404 };
	}
	return {
		message: "Name updated successfully",
		status: 200,
	};
});