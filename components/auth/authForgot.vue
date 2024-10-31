<template>
	<div class="flex min-h-screen flex-1 flex-col justify-center items-center px-6 py-8 lg:px-8">
		<div class="sm:mx-auto w-full max-w-xs sm:max-w-sm">
			<h2 class="mt-6 sm:mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
				Forgot Password
			</h2>
		</div>

		<div class="mt-6 sm:mt-10 w-full max-w-xs sm:max-w-sm bg-white shadow-lg rounded-lg p-6 sm:p-8">
			<form
				@submit.prevent="resetPassword"
				class="space-y-6">
				<div>
					<label
						for="email"
						class="block text-sm font-medium leading-6 text-gray-900"
						>Email</label
					>
					<div class="mt-2">
						<input
							id="email"
							v-model="email"
							name="email"
							type="email"
							required
							class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 bg-gray-50 sm:text-sm sm:leading-6" />
					</div>
				</div>

				<div>
					<button
						type="submit"
						class="flex w-full justify-center rounded-md bg-gradient-to-r from-indigo-600 to-blue-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-lg hover:scale-105 hover:bg-indigo-500 transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
						Reset Password
					</button>
				</div>
			</form>

			<p class="mt-10 text-center text-sm text-gray-500">
				Remembered your password?
				<nuxt-link
					to="/"
					class="font-semibold leading-6 text-blue-600 hover:text-blue-500">
					Sign in here
				</nuxt-link>
			</p>

			<p
				v-if="message"
				class="mt-2 text-center text-sm text-red-600 bg-red-100 border border-red-300 rounded-md p-2">
				{{ message }}
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const email = ref("");
const message = ref("");

async function resetPassword() {
	if (!email.value) {
		message.value = "Email is required";
		return;
	}
	try {
		const response = await $fetch("api/auth/forget-pass", {
			method: "POST",
			body: {
				email: email.value,
			},
		});
		message.value = response;
<<<<<<< HEAD
		console.log("Response == ", response);
	} catch (error) {
		console.log("Error == ", error);
=======
		// console.log("Response == ", response);
	} catch (error) {
		// console.log("Error == ", error);
>>>>>>> 158282d (Fix some issues with languages)
		message.value = "Email not found";
	}
}
</script>
