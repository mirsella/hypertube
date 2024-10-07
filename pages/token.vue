<script setup lang="ts">
definePageMeta({
	disableAuth: true,
});

const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch("/api/token", { headers });
</script>

<template></template>
