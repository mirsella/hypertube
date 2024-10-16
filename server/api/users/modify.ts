// * api/user/modify.ts
import { getServerSession } from "#auth";
import bcrypt from "bcrypt";

async function check_mail_exist(email: string) {
    const verif_mail = await db.select().from(tables.users).where(eq(tables.users.email, email));
    if (!verif_mail || verif_mail.length === 0) {
        return false;
    }
    return true;


}

export default defineEventHandler(async event => {
	try {
		const session = await getServerSession(event);
		if (!session) {
			console.log("api/user/info_profil.ts, session not found");
		} else {
			console.log("api/user/info_profil.ts, session found", session);
		}

		const { email, username, firstname, lastname, password } = await readBody(event);
		console.log("api/user/modify.ts, has been called ", { email, username, firstname, lastname, password });

		if (!email || !username || !firstname || !lastname) {
			// password is optional for 2Oauth
			throw createError({
				statusMessage: "Missing required fields",
				statusCode: 400,
			});
		}
	
        const email_exist = await check_mail_exist(email);
        // if (!email_exist) {
        //     console.log("Email doesn't exist");
        // }
   

		// const userValues: any = {
		// 	email: email,
		// 	username: username,
		// 	firstname: firstname,
		// 	lastname: lastname,
		// };

		// if (password && password.length >= 8) {
		// 	userValues.password = await bcrypt.hash(password, 10);
		// }

		// const user = await db.insert(tables.users).values(userValues);

		// if (!user) {
		// 	throw createError({
		// 		statusMessage: "Error while creating user",
		// 		statusCode: 400,
		// 	});
		// }
		return {
			message: "Profile has been changed",
			status: 200,
		};
	} catch (error) {
		return new Response("Error Auth", { status: 400 });
	}
});
