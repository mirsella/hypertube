<template>
	<div class="flex">
		<!-- Sidebar Menu -->
		<div class="w-1/4 h-screen bg-gray-200 p-4">
			<ul class="menu bg-base-200 p-4 rounded-box">
				<li>
					<a @click="activeForm = 'password'">Change Password</a>
				</li>
				<li>
					<a @click="activeForm = 'username'">Change Username</a>
				</li>
				<!-- If the user has only credentials, he can change his email -->
				<li v-if="invisible === true">
					<a @click="activeForm = 'email'">Change Email</a>
				</li>

				<li>
					<a @click="activeForm = 'name'">Change Name</a>
				</li>
			</ul>
		</div>

		<!-- Main Content -->
		<div class="w-3/4 p-4">
			<h2 class="text-2xl font-bold mb-4">Modify Profile</h2>

			<!-- Render different forms based on the selected menu item -->
			<div v-if="activeForm === 'password'">
				<userPassword :email="email" />
			</div>

			<div v-if="activeForm === 'username'">
				<userUsername
					:username="username"
					:email="email" />
			</div>

			<div v-if="activeForm === 'email' && invisible === true">
				<userMail
					:email="email"
					:username="username" />
			</div>

			<div v-if="activeForm === 'name'">
				<userName
					:firstname="firstname"
					:lastname="lastname"
					:email="email" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const activeForm = ref("password");
const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch("/api/token", { headers });
const data = reactive(useAuth());
const { status, signIn, signOut } = useAuth();
const route = useRoute();
const username = ref("");
const email = ref("");
const firstname = ref("");
const lastname = ref("");
const invisible = ref(false);

onMounted(async () => {
	console.log(token.value);
	// console.log(token.value.email);
	console.log(token.value.username);

	try {
		const response = await $fetch("/api/users/info", {
			method: "POST",
			body: {
				email: token.value.email,
			},
			headers: {
				Authorization: `Bearer ${token.value}`,
			},
		});
		console.log(response.providers);
		console.log(response.user.email);
		console.log(response.user.username);
		username.value = response.user.username;
		email.value = response.user.email;
		firstname.value = response.user.firstname;
		lastname.value = response.user.lastname;

		if (response.providers.length === 1 && response.providers.includes("credentials")) {
			console.log("Only credentials");
			invisible.value = true;
			// He can change his mail
			// otherwise he can't
		}

		console.log(response);
	} catch (error) {
		console.error(error);
	}
});
</script>
