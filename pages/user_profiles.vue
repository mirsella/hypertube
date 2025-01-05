<template>
  <userProfiles :users="users" />
</template>

<script setup lang="ts">
const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch("/api/token", { headers });
const users = ref<Array<any>>([]);
const { $eventBus } = useNuxtApp() as any;

onMounted(async () => {
  try {
    const response = await $fetch("/api/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    // @ts-ignore
    users.value = response.users;
  } catch (error) {
    console.error(error);
  }

  $eventBus.emit("CompleteProfil", true); // Emit the event to show the nav bar
});
</script>
