<template>
  <form
    @submit.prevent="submit"
    class="flex flex-col gap-4 p-6 max-w-md mx-auto"
  >
    <h1 class="text-2xl font-semibold text-center mb-4">
      {{ $t("modifyProfiles.modifyName") }}
    </h1>

    <!-- Last Name -->
    <div>
      <label
        for="lastname"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        {{ $t("userProfiles.lastname") }}
      </label>
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
          id="lastname"
          v-model="lastname"
          name="lastname"
          type="text"
          placeholder="Johnson"
          required
          class="grow bg-transparent outline-none placeholder-gray-400 text-gray-700"
        />
      </label>
    </div>

    <!-- First Name -->
    <div>
      <label
        for="firstname"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        {{ $t("userProfiles.firstname") }}
      </label>
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
          id="firstname"
          v-model="firstname"
          name="firstname"
          type="text"
          placeholder="Jeff"
          required
          class="grow bg-transparent outline-none placeholder-gray-400 text-gray-700"
        />
      </label>
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="!lastname || !firstname"
      :class="[
        'btn w-full mt-4 rounded-lg transition duration-300',
        !lastname || !firstname
          ? 'bg-red-500 text-white cursor-not-allowed opacity-70'
          : 'btn-primary hover:scale-105',
      ]"
    >
      {{ $t("modifyProfiles.Submit") }}
    </button>
  </form>
  <p class="text-center text-sm text-gray-500 mt-4">{{ message }}</p>
</template>

<script setup lang="ts">
const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch("/api/token", { headers });

const props = defineProps({
  firstname: String,
  lastname: String,
  email: String,
});

const lastname = ref(props.lastname);
const firstname = ref(props.firstname);
const email = ref(props.email);
const message = ref("");
const { $eventBus } = useNuxtApp() as unknown as {
  $eventBus: { emit: (event: string, payload: any) => void };
};

interface ModifyNameResponse {
  message: string;
  lastname: string;
  firstname: string;
}

async function submit() {
  try {
    const response = await $fetch<ModifyNameResponse>(
      "/api/users/modify/name",
      {
        method: "POST",
        body: {
          firstname: firstname.value,
          lastname: lastname.value,
          email: email.value,
        },
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      },
    );
    console.log(response);
    message.value = response.message;
    lastname.value = response.lastname;
    firstname.value = response.firstname;

    $eventBus.emit("UpdateName", {
      lastname: lastname.value,
      firstname: firstname.value,
      email: email.value,
    });
  } catch (error: any) {
    if (error) {
      message.value = error.data.message;
    }
  }
}
</script>
