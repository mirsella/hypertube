<template>
	<div>
		<label
			for="username"
			class="block text-sm font-medium leading-6 text-gray-900"
			>Username</label
		>

		<label class="input input-bordered flex items-center gap-2">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="h-4 w-4 opacity-70">
				<path
					d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
			</svg>
			<input
				id="username"
				v-model="username"
				name="username"
				type="text"
				placeholder="Simo_42"
				required
				class="grow" />
		</label>
		<button
			type="submit"
			:disabled="!username"
			:class="['btn w-full', !username ? 'bg-red-500 text-white cursor-not-allowed' : 'btn-primary']"
			@click="submit">
			Register
		</button>
	</div>
	<p>{{ message }}</p>
</template>

<script setup lang="ts">
const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch("/api/token", { headers });
const props = defineProps<{
	username: string;
	email: string;
}>();

const email = ref(props.email);
const username = ref(props.username);
const message = ref("");
const { $eventBus } = useNuxtApp();

async function submit() {
	try {
		const response = await $fetch("/api/users/modify/username", {
			method: "POST",
			body: {
				username: username.value,
				email: email.value,
			},
			headers: {
				Authorization: `Bearer ${token.value}`,
			},
		});
		console.log(response);
		message.value = response.message;
		// username.value = response.username;
		$eventBus.emit("UpdateUsername", {
			username: response.username,
			email: email.value,
		});
	} catch (error) {
		if (error.data && error.data.message) {
			message.value = error.data.message;
		}
		console.error("Erreur lors de la mise à jour du nom d'utilisateur :", error);
	}
}
</script>
