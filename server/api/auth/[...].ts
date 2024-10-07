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
		return new Response("Missing required fields", { status: 400 });
	}
	const user = await db.select().from(tables.users).where(eq(tables.users.username, username)).get();
	if (!user) {
		console.log("Username not found");
		return new Response("Username not found", { status: 400 });
	}

	if (user.password === null) {
		console;
		return new Response("Invalid password", { status: 400 });
	}

	if (user) {
		const isPasswordMatch = await bcrypt.compare(password, user.password);
		if (!isPasswordMatch)
			return new Response("Invalid password", { status: 400 });
		if (isPasswordMatch) 
		{
			return new Response(user.id , { status: 200 });
		} 
	}
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
			callbackUrl: "http://localhost:3000/api/auth/callback/google",
		}),
		// @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
		Credentials.default({
			id: "credentials",
			name: "Credentials",
			authorize: async (credentials: any) => {
				console.log("credentials, has been called ", credentials);
				const response = await check_Credentials(credentials.username, credentials.password);
				// @ts-ignore
				const userId = await response.text();  

				console.log("userId", userId);
				// @ts-ignore
				if (response.status === 200) {
					const user = { userId , name: credentials.username }; 
					return user;
				} else {
					// If you return null then an error will be displayed advising the user to check their details.
					// You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
				}
			},
		}),

	],
	callbacks: {
		jwt({ token, account }) {
			if (account) {
				token.sessionToken = account.session_token;
				token.provider = account.provider || "local";
				console.log("token", token.provider);
			}
			return token;
		},
	},
});
