// * api/auth/auth-providers.ts
async function check_providers(email: string, provider: string) {
	const user = await db.select().from(tables.users).where(eq(tables.users.email, email)).get(); // check if user exist with this email
	if (user) {
		// user exist
		const providers_exist = await db //
			.select({
				email: tables.providers.email,
				provider: tables.providers.provider,
			})
			.from(tables.providers)
			.where(and(eq(tables.providers.email, email), eq(tables.providers.provider, provider)))
			.get();

		if (providers_exist && providers_exist.provider === provider) {
			return true; // Already registered with this provider
		}
		// create new provider for an existing user
		await db.insert(tables.providers).values({
			email: email,
			provider: provider,
			user_id: user.id,
		});
		return true; // Already registered with another provider
	}

	return false; // User not exist
}

async function check_complete_profil(email: string) {
	const verif_complete_profil = await db
		.select({
			complete_profile: tables.users.complete_profile,
		})
		.from(tables.users)
		.where(eq(tables.users.email, email));

	const complete_profile = verif_complete_profil[0].complete_profile;
	if (complete_profile === "true") {
		return true;
	} else {
		return false;
	}
}

async function HandleCheckProfile(email: string) {
	const check_profil = await check_complete_profil(email);
	if (check_profil === true) {
		// console.log("User got completed profil with his provider");
		return new Response("User got completed profil with his provider", { status: 200 }); // Complete profile
	} else if (check_profil === false) {
		// console.log("Need complete profile go on /profile_completion");
		return new Response("User need to complete his profil", { status: 206 }); // Incomplete profile
	} else {
		// console.log("Error checking profile");
		return new Response("Error checking profile completion", { status: 500 });
	}
}

export default defineEventHandler(async event => {
	const { username, email, auth_provider } = await readBody(event);

	// console.log("api/auth/register-auth.ts, has been called ", { username, email, auth_provider });

	if (!username || !email || !auth_provider) {
		return new Response("Missing required fields", { status: 400 });
	}

	const already_register = await check_providers(email, auth_provider);
	// console.log("already_register", already_register);
	if (already_register === true) {
		// register with for his current provider
		return await HandleCheckProfile(email);
	}

	// console.log("Enregistrement de l'utilisateur");
	// enregistrement for the first time no provider exist
	await db.insert(tables.users).values({
		username,
		email,
		lastname: "",
		firstname: "",
	});

	const user = await db.select().from(tables.users).where(eq(tables.users.email, email)).get();

	if (user) {
		await db.insert(tables.providers).values({
			email: email,
			provider: auth_provider,
			user_id: user.id,
		});
	}

	// console.log("User need to complete his profil");
	return new Response("User need to complete his profil", { status: 206 }); // Incomplete profile
});
