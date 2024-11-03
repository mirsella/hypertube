// * api/users.ts
import { getServerSession } from "#auth";


export default defineEventHandler(async event => {
	const session = await getServerSession(event);

	if (!session) {
		return { message: "User is not authenticated", status: 400 };
	}

	var users = await db.select().from(tables.users);
	console.log("api/users.ts, users ======================= ", users);
	return { message: "Retrieve users successful", users }; // Retour sans `new Response`
});
