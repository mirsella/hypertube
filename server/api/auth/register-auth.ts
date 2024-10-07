// * api/auth/register.ts
import bcrypt from "bcrypt";

async function check_already_register(username: string, email: any) {
	const verif_mail = await db.select().from(tables.users).where(eq(tables.users.email, email));

	if (verif_mail.length > 0) {
		const providers_exist = await db
			.select({
				email: tables.providers.email,
				provider: tables.providers.provider,
			})
			.from(tables.providers)
			.where(eq(tables.providers.email, email))
			.get();
		if (!providers_exist) {
			return { message: "Email already used", status: 400 };
		}
		return { message: `You are already registered with this email with ${providers_exist.provider}`, status: 400 };
	}

	const verif_username = await db.select().from(tables.users).where(eq(tables.users.username, username));

	if (verif_username.length > 0) {
		return { message: "Username already used", status: 400 };
	}
	return 0;
}
// Creditencials way
export default defineEventHandler(async event => {
	const { username, email, lastname, firstname, password } = await readBody(event); 
	console.log("api/auth/register-auth.ts, has been called ", { username, email, lastname, firstname, password });

	if (!username || !email || !lastname || !firstname || !password) {
		return new Response("Missing required fields", { status: 400 });
	}

	const check = await check_already_register(username, email);

	if (check !== 0) {
		return new Response(check.message, { status: check.status });
	}

	const hashed_password = await bcrypt.hash(password, 10);

	await db.insert(tables.users).values({
		username,
		email,
		lastname,
		firstname,
		password: hashed_password,
		complete_profile: "true",
	});

	const user = await db.select().from(tables.users).where(eq(tables.users.username, username)).get();
	if (user) {
		await db.insert(tables.providers).values({
			email: email,
			provider: "credentials",
			user_id: user.id,
		});
	}

	return new Response("User created", {
		status: 200, // Statut HTTP
	});
});
