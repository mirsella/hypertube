// file: ~/server/api/auth/[...].ts
import { NuxtAuthHandler } from "#auth";
// @ts-ignore
import Credentials from "next-auth/providers/credentials";
// @ts-ignore
import GithubProvider from "next-auth/providers/github";
// @ts-ignore
import FortyTwo from "next-auth/providers/42-school";
// @ts-ignore
import Google from "next-auth/providers/google";
// @ts-ignore
import bcrypt from "bcryptjs";
// @ts-ignore
import Discord from "next-auth/providers/discord";


async function check_Credentials(username: string, password: string) 
{
	if (!username || !password) {
		throw new Error("Missing required fields");
	}

	const user = await db.select().from(tables.users).where(eq(tables.users.username, username)).limit(1).then(results => results[0]);
	if (!user) {
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
	secret: process.env.AUTH_SECRET || 'dev-secret', 
	providers: [
		// @ts-ignore @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
		GithubProvider.default({
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
		}),
		// @ts-ignore @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
		FortyTwo.default({
			clientId: process.env.FORTYTWO_CLIENT_ID,
			clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
		}),
		// @ts-ignore @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
		Google.default({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
		// @ts-ignore @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
		Discord.default({
			clientId: process.env.DISCORD_CLIENT_ID,
			clientSecret: process.env.DISCORD_CLIENT_SECRET,
		}),
		
		// @ts-ignore @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
		Credentials.default({
			id: "credentials",
			name: "Credentials",
			authorize: async (credentials: any) => {
				try {
					// Appel de la fonction pour vérifier les informations d'identification
					const user = await check_Credentials(credentials.username, credentials.password);
					// Si l'utilisateur existe, on retourne son email et son nom
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
