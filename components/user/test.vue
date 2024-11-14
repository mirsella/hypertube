<template>
  <div>
    <h1>Test</h1>
    <UserMail email="test@test.com" username="test" />
  </div>
</template>

<script setup lang="ts">
// Import components

const { data: token } = await useFetch("/api/token");
</script>
