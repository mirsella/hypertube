<template>
	<div v-if="loggedIn">
		<Header />
	</div>
	<p> blabla </p>
	<p> blabla </p>
	<p> blabla </p>
	<NuxtPage />
</template>

<script setup lang="ts">
const { status, signOut } = useAuth();
const data = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

async function handleSignOut() {
	await signOut();
	navigateTo("/");
}
</script>
