<template>
    <!-- <div v-if="isLoading">
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
  </div>
  <div v-else> -->
    <div class="flex min-h-screen flex-col justify-center items-center px-6 py-12 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                Sign in to your account
            </h2>
        </div>

        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white shadow-lg rounded-lg p-8">
            <form @submit.prevent="authentification" class="space-y-6">
                <div class="form-control">
                    <label for="username" class="label">Username</label>
                    <div class="mt-2">
                        <input id="username" v-model="username" name="username" type="text" required
                            class="input input-bordered w-full focus:ring focus:ring-indigo-300 focus:border-indigo-500" />
                    </div>
                </div>

                <div class="form-control">
                    <div class="flex items-center justify-between">
                        <label for="password" class="label">Password</label>
                        <div class="text-sm font-medium">
                            <nuxt-link to="/forgot_password" class="link link-primary">Forgot password?</nuxt-link>
                        </div>
                    </div>
                    <div class="mt-2">
                        <input id="password" v-model="password" name="password" type="password" required
                            class="input input-bordered w-full focus:ring focus:ring-indigo-300 focus:border-indigo-500" />
                    </div>
                </div>
                <div class="flex items-center justify-center">
                    <p>{{ message }}</p>
                </div>

                <div class="flex items-center justify-center">
                    <button type="submit"
                        class="btn btn-primary w-full hover:bg-indigo-600 transition duration-200 ease-in-out">
                        Sign in
                    </button>
                </div>
            </form>
            <p class="text-center mt-2 text-sm text-gray-500">Or sign in with</p>
            <div class="flex justify-center space-x-4">
                <Icon @click="login('github')" name="uil:github"
                    style="color: black; font-size: 36px; cursor: pointer" />
                <Icon @click="login('google')" name="uil:google" style="color: red; font-size: 36px; cursor: pointer" />
                <img src="/42.png" alt="Image" @click="login('42-school')"
                    style="width: 36px; height: 36px; cursor: pointer" />
                <img src="/discord-icon.png" alt="Image" @click="login('discord')"
                    style="width: 36px; height: 36px; cursor: pointer" />
            </div>
            <p class="mt-4 text-center text-sm text-gray-500">
                Not a member?
                <nuxt-link to="/register" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">You can
                    register here</nuxt-link>
            </p>
        </div>
    </div>
    <pre>{{ data }}</pre>
    <div>{{ token || "no token present, are you logged in?" }}</div>
    <!-- </div> -->
</template>

<script setup lang="ts">
interface Token {
    provider?: string;
}

const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch<Token>("/api/token", { headers });
const { status, signIn } = useAuth();
const isLoading = ref(true);
const username = ref("");
const password = ref("");
const data = reactive(useAuth());
const message = ref("");
const showAnimation = ref(false);

import LottieAnimation from "~/components/lotie/lotieAnimation.vue";
import animationData from "~/assets/lottie/loading.json";

async function login(provider: string) {
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
            navigateTo("/search");
        } else if (response === "User need to complete his profil") {
            navigateTo("/profile_completion");
        } else if (response === "Missing require fields") {
            navigateTo("/");
        }
    } catch (error: any) {
        message.value = error;
    }
}

async function authentification() {
    try {
        const result = await signIn("credentials", {
            username: username.value,
            password: password.value,
            redirect: false,
        });

        if (result?.ok) {
            navigateTo("/search");
        } else {
            message.value = "Username or password incorrect";
        }
    } catch (error) {
        message.value = "An error occurred during sign in";
        console.error("Failed to sign in:", error);
    }
}

onMounted(async () => {
    //prettier-ignore
    if (token.value && status.value === "authenticated" &&
        token.value.provider === "credentials") {
        // case credentials
        navigateTo("/search");
    } else if (status.value === "authenticated" || token.value) {
        // case github, 42 or google
        if (token.value !== null && token.value.provider)
            await HandleSignIn(token.value.provider);

        showAnimation.value = true;
        setTimeout(() => {
            isLoading.value = false;
        }, 1000);
    }
});
</script>
