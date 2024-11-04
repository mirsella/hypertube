import { getToken } from "#auth";
import { getServerSession } from "#auth";
// * api/users.ts

export default defineEventHandler(async event => {
	const session = await getServerSession(event);
	const token = await getToken({ event });
	if (!token || !token.email) {
		return { message: "Unauthorized", status: 401 };
	}

	if (!session) {
		return { message: "User is not authenticated", status: 400 };
	}

	var users = await db.select().from(tables.users);
	console.log("api/users.ts, users ======================= ", users);
	return { message: "Retrieve users successful", users }; // Retour sans `new Response`
});
