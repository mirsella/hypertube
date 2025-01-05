<template>
  <div class="flex flex-col gap-4 p-6 max-w-md mx-auto">
    <h1 class="text-2xl font-semibold text-center mb-4">
      {{ $t("modifyProfiles.modifyUsernames") }}
    </h1>

    <!-- Label for Username -->
    <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
      {{ $t("userProfiles.username") }}
    </label>

    <!-- Username Input with Icon -->
    <label
      class="input input-bordered flex items-center gap-2 p-3 rounded-lg shadow-sm border border-gray-300 hover:border-primary focus-within:border-primary transition duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        class="h-5 w-5 text-gray-500 opacity-80"
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
        class="grow bg-transparent outline-none placeholder-gray-400 text-gray-700"
      />
    </label>

    <!-- Register Button -->
    <button
      type="submit"
      :disabled="!username"
      :class="[
        'btn w-full mt-2 rounded-lg transition duration-300',
        username
          ? 'btn-primary hover:scale-105'
          : 'bg-red-500 text-white cursor-not-allowed opacity-70',
      ]"
      @click="submit"
    >
      {{ $t("modifyProfiles.Submit") }}
    </button>
  </div>
  <p class="text-center text-sm text-gray-500 mt-4">{{ message }}</p>
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
const { $eventBus } = useNuxtApp() as any;

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
    const responseData = response as { message: string; username?: string };
    message.value = responseData.message;
    // username.value = response.username;
    $eventBus.emit("UpdateUsername", {
      username: responseData.username,
      email: email.value,
    });
  } catch (error) {
    if ((error as any).data && (error as any).data.message) {
      message.value = (error as any).data.message;
    }
    console.error(
      "Erreur lors de la mise à jour du nom d'utilisateur :",
      error,
    );
  }
}
</script>
