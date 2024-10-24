// * api/user/modify/name.ts

import { getServerSession } from "#auth";


export default defineEventHandler(async event => {
	const session = await getServerSession(event);

	if (!session) {
		return { message: "User is not authentificated", status: 400 };
	} else {
		console.log("api/user/info_profil.ts, session found", session);
	}

    

});