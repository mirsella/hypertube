// * api/auth/auth-providers.ts
async function check_providers(email: string, provider: string) {
	// Vérifier si l'utilisateur existe avec cet e-mail
	const user = (await db.select().from(tables.users).where(eq(tables.users.email, email)).limit(1))[0];
	
	if (user) {
		// L'utilisateur existe
		const providers_exist = (await db //
			.select({
				email: tables.providers.email,
				provider: tables.providers.provider,
			})
			.from(tables.providers)
			.where(and(eq(tables.providers.email, email), eq(tables.providers.provider, provider)))
			.limit(1))[0];

		if (providers_exist && providers_exist.provider === provider) {
			return true; // Déjà enregistré avec ce provider
		}
		// Créer un nouveau provider pour un utilisateur existant
		await db.insert(tables.providers).values({
			email: email,
			provider: provider,
			user_id: user.id,
		});
		return true; // Déjà enregistré avec un autre provider
	}

	return false; // Utilisateur n'existe pas
}

async function check_complete_profil(email: string) {
	const verif_complete_profil = await db
		.select({
			complete_profile: tables.users.complete_profile,
		})
		.from(tables.users)
		.where(eq(tables.users.email, email));

	const complete_profile = verif_complete_profil[0]?.complete_profile;
	if (complete_profile === true) {
		return true;
	} else {
		return false;
	}
}

async function HandleCheckProfile(email: string) {
	const check_profil = await check_complete_profil(email);
	if (check_profil === true) {
		return new Response("User got completed profil with his provider", { status: 200 }); // Profil complet
	} else if (check_profil === false) {
		return new Response("User need to complete his profil", { status: 206 }); // Profil incomplet
	} else {
		return new Response("Error checking profile completion", { status: 500 });
	}
}

export default defineEventHandler(async event => {
	const { username, email, auth_provider } = await readBody(event);

	if (!username || !email || !auth_provider) {
		return new Response("Missing required fields", { status: 400 });
	}

	const already_register = await check_providers(email, auth_provider);
	if (already_register === true) {
		return await HandleCheckProfile(email);
	}

	// Enregistrement pour la première fois sans provider existant
	await db.insert(tables.users).values({
		username,
		email,
		lastname: "",
		firstname: "",
	});

	const user = (await db.select().from(tables.users).where(eq(tables.users.email, email)).limit(1))[0];

	if (user) {
		await db.insert(tables.providers).values({
			email: email,
			provider: auth_provider,
			user_id: user.id,
		});
	}

	return new Response("User need to complete his profil", { status: 206 }); // Profil incomplet
});
