// file: ~/server/api/auth/[...].ts
import { NuxtAuthHandler } from "#auth";
import GithubProvider from "next-auth/providers/github";
import FortyTwo from "next-auth/providers/42-school";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

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
			name: "Credentials",
			authorize: async (credentials: any) => {
				try {
					console.log("credentials", credentials);

					const response = await $fetch("/api/auth/sign-in", {
						method: "POST",
						body: {
							username: credentials.username,
							password: credentials.password,
						},
					});

				
					return response ;
				} catch (error) {
					console.error("error", error);
					return false;
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
