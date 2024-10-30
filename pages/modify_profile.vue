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
				<!-- "Change Email" option visible mais désactivée si invisible est false -->
				<li>
					<a
						@click="invisible && (activeForm = 'email')"
						:class="{
							'text-gray-400 cursor-not-allowed': !invisible,
							'text-black-500 ': invisible
						}">
						Change Email
					</a>
				</li>

				<li>
					<a @click="activeForm = 'name'">Change Name</a>
				</li>
				<li>
					<a @click="activeForm = 'picture'">Change Picture</a>
				</li>
			</ul>
		</div>

		<!-- Main Content -->
		<div class="w-3/4 p-4">
			<div v-if="activeForm === 'password'">
				<userPassword :email="email" />
			</div>

			<div v-if="activeForm === 'username'">
				<userUsername :username="username" :email="email" />
			</div>

			<div v-if="activeForm === 'email' && invisible === true">
				<userMail :email="email" :username="username" />
			</div>

			<div v-if="activeForm === 'name'">
				<userName :firstname="firstname" :lastname="lastname" :email="email" />
			</div>

			<div v-if="activeForm === 'picture'">
				<userPicture :picture="picture" :email="email" />
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
const picture = ref("");
const { $eventBus } = useNuxtApp();

onMounted(async () => {
	$eventBus.emit("CompleteProfil", true);

	try {
		const response = await $fetch("/api/users/profil", {
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
		console.log("picture ", response.user.picture);

		username.value = response.user.username;
		email.value = response.user.email;
		firstname.value = response.user.firstname;
		lastname.value = response.user.lastname;
		picture.value = response.user.picture;

		console.log(response.providers.length);
		if (response.providers.length === 1 && response.providers.includes("credentials")) {
			console.log("Only credentials");
			invisible.value = true;
		}

		console.log(response);
	} catch (error) {
		console.error(error);
	}
	// get update from other components
	await updateName();
	await updateUsername();
	await updateMail();
	await updatePicture();
});

async function updateUsername() {
	$eventBus.on("UpdateUsername", (payload: { username: string; email: string }) => {
		console.log("UpdateUsername", payload);
		if (!payload.username) {
			return;
		}
		username.value = payload.username;
		email.value = payload.email;
	});
}

async function updateMail() {
	$eventBus.on("UpdateMail", (payload: { email: string }) => {
		console.log("UpdateMail", payload);
		if (!payload.email) {
			return;
		}
		email.value = payload.email;
	});
}

async function updateName() {
	$eventBus.on("UpdateName", (payload: { firstname: string; lastname: string; email: string }) => {
		if (!payload.firstname || !payload.lastname) {
			return;
		}
		console.log("UpdateName blabla", payload);
		lastname.value = payload.lastname;
		firstname.value = payload.firstname;
		email.value = payload.email;
	});
}

async function updatePicture() {
	$eventBus.on("UpdatePicture", (payload: { picture: string; email: string }) => {
		if (!payload.picture || !payload.email) {
			return;
		}
		console.log("UpdatePicture", payload);
		picture.value = payload.picture;
		email.value = payload.email;
	});
}

onBeforeUnmount(() => {
	$eventBus.off("UpdateUsername", updateUsername);
	$eventBus.off("UpdateMail", updateMail);
	$eventBus.off("UpdateName", updateName);
});
</script>
