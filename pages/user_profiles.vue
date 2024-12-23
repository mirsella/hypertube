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
		// console.log("response users:", response.users);

		// console.log("response users ==== :", response.users);
		// @ts-ignore
		users.value = response.users;
		for (var i = 0; i < users.value.length; i++) {
			// convert the string to boolean
			users.value[i].complete_profile = users.value[i].complete_profile === "true" ? true : false;
			console.log("le type de complete profil === :", typeof users.value[i].complete_profile);
		}
	} catch (error) {
		console.error(error);
	}

	$eventBus.emit("CompleteProfil", true); // Emit the event to show the nav bar
});
</script>
