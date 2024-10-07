<template>
	<div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-sm">
			<h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
				Complete your profile
			</h2>
		</div>

		<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
			<form
				@submit.prevent="register"
				class="space-y-6">
				<div>
					<label
						for="username"
						class="block text-sm font-medium leading-6 text-gray-900">
						Username
					</label>

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
				</div>

				<div>
					<label
						for="lastname"
						class="block text-sm font-medium leading-6 text-gray-900">
						Last Name
					</label>
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
							type="lastname"
							placeholder="Johnson"
							required
							class="grow" />
					</label>
				</div>
				<div>
					<label
						for="lastname"
						class="block text-sm font-medium leading-6 text-gray-900">
						First Name
					</label>
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
							type="firstname"
							placeholder="Jeff"
							required
							class="grow" />
					</label>
				</div>

				<div>
					<button
						type="submit"
						:disabled="!username || !lastname || !firstname"
						:class="[
							'btn w-full',
							!username || !lastname || !firstname
								? 'bg-red-500 text-white cursor-not-allowed'
								: 'btn-primary',
						]">
						Register
					</button>
				</div>
			</form>

			<p
				v-if="message"
				class="mt-2 text-center text-sm text-red-500">
				{{ message }}
			</p>
		</div>
	</div>

	<div
		v-if="showAnimation"
		class="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-60">
		<LottieAnimation
			:animationData="animationData"
			:loop="false"
			:autoplay="true" />
	</div>
</template>

<script setup lang="ts">
import LottieAnimation from "~/components/lotie/lotieAnimation.vue";
import animationData from "~/assets/lottie/valide_form.json";

const username = ref("");
const lastname = ref("");
const firstname = ref("");
const message = ref("");
const showAnimation = ref(false);

async function register() {
	console.log("Username: ", username.value);
	try {
		const response = await $fetch("api/auth/finish-register", {
			method: "POST",
			body: {
				username: username.value,
				lastname: lastname.value,
				firstname: firstname.value,
			},
		});
		console.log(response);
		message.value = response;
		showAnimation.value = true;
		setTimeout(() => {
			navigateTo("/dashboard");
		}, 2000);
	} catch (error) {
		const errMessage = await error.data;
		message.value = errMessage;
	}
}
</script>
