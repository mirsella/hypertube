<template>
	<div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-sm">
			<h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
				Sign in to your account
			</h2>
		</div>

		<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
			<form
				@submit.prevent="authentification"
				class="space-y-6">
				<div class="form-control">
					<label
						for="username"
						class="label"
						>Username</label
					>
					<div class="mt-2">
						<input
							id="username"
							v-model="username"
							name="username"
							type="text"
							required
							class="input input-bordered w-full" />
					</div>
				</div>

				<div class="form-control">
					<div class="flex items-center justify-between">
						<label
							for="password"
							class="label"
							>Password</label
						>
						<div class="text-sm">
							<nuxt-link
								to="/forgot_password"
								class="link link-primary"
								>Forgot password?</nuxt-link
							>
						</div>
					</div>
					<div class="mt-2">
						<input
							id="password"
							v-model="password"
							name="password"
							type="password"
							required
							class="input input-bordered w-full" />
					</div>
				</div>

				<div class="flex items-center justify-center">
					<button
						type="submit"
						class="btn btn-primary w-full">
						Sign in
					</button>
				</div>
			</form>
			<p class="text-center mt-2 text-sm text-gray-500">Or sign in with</p>
			<div class="flex justify-center space-x-4">
				<Icon
					@click="login('github')"
					name="uil:github"
					style="color: black; font-size: 36px; cursor: pointer" />
				<Icon
					@click="login('google')"
					name="uil:google"
					style="color: red; font-size: 36px; cursor: pointer" />
				<img
					src="/42.png"
					alt="Image"
					@click="login('42-school')"
					style="width: 36px; height: 36px; cursor: pointer" />
			</div>
			<p class="mt-4 text-center text-sm text-gray-500">
				Not a member?
				<nuxt-link
					to="/register"
					class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
					>You can register here</nuxt-link
				>
			</p>
		</div>
	</div>

	<pre>{{ data }}</pre>
	<div>{{ token || "no token present, are you logged in?" }}</div>
</template>

<script setup lang="ts">
const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch("/api/token", { headers });

const { status, signIn, signOut } = useAuth();
const route = useRoute();

const username = ref("");
const password = ref("");
const connexion_way = ref("");
const loggedIn = computed(() => status.value === "authenticated");
const data = reactive(useAuth());

async function login(provider: string) {
	console.log("provider", provider);
	await signIn(provider);
}

async function HandleSignIn(provider: string) {
	try {
		
		if (!data.data || !data.data.user) {
			throw new Error("User data not available after GitHub sign-in");
		}
		const response = await $fetch("api/auth/auth-providers", {
			method: "POST",
			body: {
				username: data.data.user.name,
				email: data.data.user.email,
				auth_provider: provider, // github ou 42 ou google
			},
		});

		if (
			response === "User got completed profil with his provider" ||
			response === "User got completed profil with another provider"
		) {
			console.log("User got completed profil with his provider");

			navigateTo("/dashboard");
		} else if (response === "User need to complete his profil") {
			console.log("response", response);
			navigateTo("/profile_completion");
		} else if (response === "Missing require fields") {
			// enregister avec un autre provider case a gerer plus tard !!
			console.log("response", response);
			navigateTo("/");
		}
	} catch (error) {
		console.log("error", error);
	}
}

async function authentification() {
	// not working yet
	console.log("authentification");

	const { error, url, user } = await signIn('credentials', { username: username.value, password: password.value, redirect: false })
	if (error) {
		console.error("Failed to sign in", error)
		alert("You have made a terrible mistake while entering your credentials");
	} else 
	{
		navigateTo("/dashboard");
	}

}

onMounted(async () => {
	if (token.value && status.value === "authenticated" && token.value.provider === "credentials") // case credentials
	{
		navigateTo("/dashboard");
	}
	else if (status.value === "authenticated" || token.value) { // case github, 42 or google
		console.log("token.value.provider", token.value.provider);
		await HandleSignIn(token.value.provider);
	}
});

// watch(
// 	() => status.value,
// 	async (newStatus) => {
// 		if (newStatus === "authenticated") {
// 			await HandleSignIn(token.value.provider);
// 		}
// 	}
// );
</script>
