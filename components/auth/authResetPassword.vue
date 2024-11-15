<template>
  <div
    class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2
        class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900"
      >
        Create a new password
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form @submit.prevent="registerNewPassword" class="space-y-6">
        <div>
          <label
            for="password"
            class="block text-sm font-medium leading-6 text-gray-900"
            >Password</label
          >
          <div class="mt-2">
            <label class="input input-bordered flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                class="h-4 w-4 opacity-70"
              >
                <path
                  fill-rule="evenodd"
                  d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                  clip-rule="evenodd"
                />
              </svg>
              <input
                id="password"
                v-model="password"
                name="password"
                type="password"
                placeholder="********"
                required
                class="grow"
              />
            </label>
            <small :class="isPasswordValid ? 'text-green-500' : 'text-red-500'">
              {{
                isPasswordValid
                  ? "Password is valid"
                  : "Password must be at least 8 characters long, include an uppercase letter, a number, and a special character."
              }}
            </small>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="!isPasswordValid"
            :class="[
              'btn w-full',
              !isPasswordValid
                ? 'bg-red-500 text-white cursor-not-allowed'
                : 'btn-primary',
            ]"
          >
            Create Password
          </button>
        </div>
      </form>

      <p class="mt-10 text-center text-sm text-gray-500">
        You remember your password?
        <nuxt-link
          to="/"
          class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
        >
          Sign in here
        </nuxt-link>
      </p>

      <p v-if="message" class="mt-2 text-center text-sm text-red-500">
        {{ message }}
      </p>
    </div>
  </div>

  <div
    v-if="showAnimation"
    class="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-60"
  >
    <LottieAnimation
      :animationData="animationData"
      :loop="false"
      :autoplay="true"
    />
  </div>
</template>

<script setup lang="ts">
import LottieAnimation from "~/components/lotie/lotieAnimation.vue";
import animationData from "~/assets/lottie/valide_form.json";

import { ref, computed } from "vue";

const password = ref("");
const message = ref("");
const showAnimation = ref(false);
const route = useRoute();
const token = route.params.token;

const isPasswordValid = computed(() => validatePassword(password.value));

function validatePassword(password: string) {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

async function registerNewPassword() {
  try {
    const response = await $fetch("/api/auth/reset-password", {
      method: "POST",
      body: {
        password: password.value,
        token: token,
      },
    });
    message.value = "The password has been reset successfully";

    showAnimation.value = true;
    setTimeout(() => {
      showAnimation.value = false;
      navigateTo("/");
    }, 2000);
  } catch (error) {
    console.error("Erreur capturée :", error);
    message.value = "An error occurred while resetting the password.";
  }
}
</script>
