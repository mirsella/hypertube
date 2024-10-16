// file: ~/server/api/auth/[...].ts
import { NuxtAuthHandler } from "#auth";
import GithubProvider from "next-auth/providers/github";
import FortyTwo from "next-auth/providers/42-school";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";


async function check_Credentials(username: string, password: string) {
	console.log("api/auth/sign-in.ts, has been called ", { username, password });
	if (!username || !password) {
		throw new Error("Missing required fields");
	}

	const user = await db.select().from(tables.users).where(eq(tables.users.username, username)).get();
	if (!user) {
		console.log("Username not found");
		throw new Error("Username not found");
	}

	if (!user.password) {
		throw new Error("Invalid password");
	}

	const isPasswordMatch = await bcrypt.compare(password, user.password);
	if (!isPasswordMatch) {
		throw new Error("Invalid password");
	}

	return user;
}

export default NuxtAuthHandler({
	providers: [
		// @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
		GithubProvider.default({
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
		}),
		// @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
		FortyTwo.default({
			clientId: process.env.FORTYTWO_CLIENT_ID,
			clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
		}),
		// @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
		Google.default({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
		// @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
		Credentials.default({
			id: "credentials",
			name: "Credentials",
			authorize: async (credentials: any) => {
				try {
					// Appel de la fonction pour vérifier les informations d'identification
					const user = await check_Credentials(credentials.username, credentials.password);
					// Si l'utilisateur est trouvé et authentifié, on retourne un objet user avec email et username
					if (user) {
						return { email: user.email, name: credentials.username };
					} else {
						return null; 
					}
				} catch (error) {
					console.error("Authentication error:", error);
					return null; 
				}
			},
		}),
	],
	callbacks: {
		jwt({ token, account, user }) {
			if (account) {
				token.provider = account.provider || "credentials";
			}
	
			if (user?.email) {
				token.email = user.email;
			}
			return token;
		},
	

		session({ session, token }) {
			if (token.email) {
				//@ts-ignore
				session.user.email = token.email;
			}
			return session;
		},
	},
});
