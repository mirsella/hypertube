<template>
  <div>
    <label for="email" class="block text-sm font-medium leading-6 text-gray-900"
      >Email</label
    >
    <label class="input input-bordered flex items-center gap-2">
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
        isEmailValid ? "Email is valid" : "Please enter a valid email address"
      }}
    </small>
    <button
      type="submit"
      :disabled="!isEmailValid"
      :class="[
        'btn w-full',
        !email ? 'bg-red-500 text-white cursor-not-allowed' : 'btn-primary',
      ]"
      @click="submit"
    >
      Register
    </button>
  </div>
  <p>{{ message }}</p>
</template>

<script setup lang="ts">
const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch("/api/token", { headers });
const { $eventBus } = useNuxtApp();
const { signOut } = useAuth();

const isEmailValid = computed(() => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return regex.test(email.value);
});

const props = defineProps<{
  email: string;
  username: string;
}>();
const message = ref("");
const email = ref(props.email);
const username = ref(props.username);

async function submit() {
  const confirmed = confirm(
    "Are you sure you want to update your email? U will be disconnected",
  );
  try {
    const response = await $fetch("/api/users/modify/mail", {
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
    message.value = (response as any).response.message;
    if (confirmed) {
      console.log("disconnect");
      await signOut();
      navigateTo("/");
    }
    // email.value = response.email;

    // $eventBus.emit("UpdateMail", {
    // 	email: email.value,
    // });
  } catch (error: any) {
    if (error.data && error.data.message) {
      message.value = error.data.message;
    }
    console.error(
      "Erreur lors de la mise à jour du nom d'utilisateur :",
      error,
    );
  }
}
</script>
