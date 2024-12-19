<template>
  <div
    class="flex min-h-screen flex-col justify-center items-center px-6 py-8 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2
        class="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900"
      >
        Register to your account
      </h2>
    </div>

    <div
      class="mt-4 sm:mt-6 w-full max-w-xs sm:max-w-sm bg-white shadow-md rounded-md p-4"
    >
      <form @submit.prevent="register" class="space-y-6">
        <!-- Username -->
        <div>
          <label
            for="username"
            class="block text-sm font-medium leading-6 text-gray-900"
            >Username</label
          >
          <label
            class="input input-bordered flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600 transition duration-200 ease-in-out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-4 w-4 opacity-70"
            >
              <path
                d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
              />
            </svg>
            <input
              id="username"
              v-model="username"
              name="username"
              type="text"
              placeholder="Simo_42"
              required
              class="grow"
            />
          </label>
        </div>

        <!-- Email -->
        <div>
          <label
            for="email"
            class="block text-sm font-medium leading-6 text-gray-900"
            >Email</label
          >
          <label
            class="input input-bordered flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600 transition duration-200 ease-in-out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-4 w-4 opacity-70"
            >
              <path
                d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z"
              />
              <path
                d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z"
              />
            </svg>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              placeholder="example@example.com"
              required
              class="grow"
            />
          </label>
          <small :class="isEmailValid ? 'text-green-500' : 'text-red-500'">
            {{
              isEmailValid
                ? "Email is valid"
                : "Please enter a valid email address"
            }}
          </small>
        </div>

        <!-- Lastname -->
        <div>
          <label
            for="lastname"
            class="block text-sm font-medium leading-6 text-gray-900"
            >Last Name</label
          >
          <label
            class="input input-bordered flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600 transition duration-200 ease-in-out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-4 w-4 opacity-70"
            >
              <path
                d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
              />
            </svg>
            <input
              id="lastname"
              v-model="lastname"
              name="lastname"
              type="text"
              placeholder="Johnson"
              required
              class="grow"
            />
          </label>
        </div>

        <!-- Firstname -->
        <div>
          <label
            for="firstname"
            class="block text-sm font-medium leading-6 text-gray-900"
            >First Name</label
          >
          <label
            class="input input-bordered flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600 transition duration-200 ease-in-out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-4 w-4 opacity-70"
            >
              <path
                d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
              />
            </svg>
            <input
              id="firstname"
              v-model="firstname"
              name="firstname"
              type="text"
              placeholder="Jeff"
              required
              class="grow"
            />
          </label>
        </div>

        <!-- Password -->
        <div>
          <label
            for="password"
            class="block text-sm font-medium leading-6 text-gray-900"
            >Password</label
          >
          <div class="mt-2">
            <label
              class="input input-bordered flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600 transition duration-200 ease-in-out"
            >
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
            :disabled="
              !isPasswordValid ||
              !isEmailValid ||
              !username ||
              !email ||
              !lastname ||
              !firstname
            "
            :class="[
              'btn w-full text-white py-2 rounded-md font-semibold transition duration-200 ease-in-out',
              !isPasswordValid || !isEmailValid
                ? 'bg-red-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700',
            ]"
          >
            Register
          </button>
        </div>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        Already registered?
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

const username = ref("");
const email = ref("");
const lastname = ref("");
const firstname = ref("");
const password = ref("");
const message = ref("");
const showAnimation = ref(false);

const isPasswordValid = computed(() => validatePassword(password.value));
function validatePassword(password: string) {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

const isEmailValid = computed(() => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return regex.test(email.value);
});

async function register() {
  try {
    const response = await $fetch("api/auth/register-auth", {
      method: "POST",
      body: {
        username: username.value,
        email: email.value,
        lastname: lastname.value,
        firstname: firstname.value,
        password: password.value,
      },
    });

    console.log(response);
    message.value = (response as any).response;
    console.log("message:", message.value);
    showAnimation.value = true;
    setTimeout(() => {
      navigateTo("/");
    }, 2000);
  } catch (response) {
    console.log(response);
    message.value = "An error occurred during registration";
  }
}
</script>
