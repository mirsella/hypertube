<template>
	<form @submit.prevent="submit">
		<div>
			<label
				for="lastname"
				class="block text-sm font-medium leading-6 text-gray-900"
				>Last Name</label
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
					id="lastname"
					v-model="lastname"
					name="lastname"
					type="text"
					placeholder="Johnson"
					required
					class="grow" />
			</label>
		</div>

		<!-- Firstname -->
		<div>
			<label
				for="firstname"
				class="block text-sm font-medium leading-6 text-gray-900"
				>First Name</label
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
					id="firstname"
					v-model="firstname"
					name="firstname"
					type="text"
					placeholder="Jeff"
					required
					class="grow" />
			</label>
		</div>
		<button
			type="submit"
			class="btn">
			Submit
		</button>
	</form>
	<p>{{ message }}</p>
</template>

<script setup lang="ts">
const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch("/api/token", { headers });

const props = defineProps<{
	firstname: string;
	lastname: string;
	email: string;
}>();

const lastname = ref(props.firstname);
const firstname = ref(props.lastname);
const email = ref(props.email);
const message = ref("");
const { $eventBus } = useNuxtApp();

async function submit() {
	try {
		const response = await $fetch("/api/users/modify/name", {
			method: "POST",
			body: {
				firstname: firstname.value,
				lastname: lastname.value,
				email: email.value,
			},
			headers: {
				Authorization: `Bearer ${token.value}`,
			},
		});
		console.log(response);
		message.value = response.message;
		lastname.value = response.lastname;
		firstname.value = response.firstname;
		$eventBus.emit("UpdateName", {
			firstname: firstname.value,
			lastname: lastname.value,
			email: email.value,
		});
		
	} catch (error) {
		if (error.data && error.data.message) {
			message.value = error.data.message;
		}
	}
}
</script>
