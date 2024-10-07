<template>
<p> Welcome to the dashboard! </p>
	<pre>{{ data }}</pre>
	<div>{{ token || "no token present, are you logged in?" }}</div>
</template>

<script setup lang="ts">

const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch("/api/token", { headers });

const { status, signIn, signOut } = useAuth();
const route = useRoute();

const username = ref("");
const password = ref("");
const connexion_way = ref("");
const loggedIn = computed(() => status.value === "authenticated");
const data = reactive(useAuth());


</script>
