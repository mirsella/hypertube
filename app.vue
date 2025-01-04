<template>
  <div v-if="status === 'authenticated'">
    <Header />
  </div>
  <NuxtPage />
</template>

<script setup lang="ts">
const { status } = useAuth();
</script>
