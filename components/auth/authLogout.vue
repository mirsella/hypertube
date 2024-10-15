<template>
	<div class="navbar bg-primary text-primary-content">
		<button class="btn btn-ghost text-xl">daisyUI</button>
		<div class="flex-grow"></div>
		<button
			@click="handleSignOut"
			class="btn btn-error">
			Sign Out
		</button>

		<button
			@click="userProfiles"
			class="btn btn-error">
			User Profiles
		</button>
		<button
			@click="modifyProfile"
			class="btn btn-error">
			modify ur Profile
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const { status, signOut } = useAuth();
const data = useAuth();
const loggedIn = computed(() => status.value === "authenticated");

async function handleSignOut() {
	await signOut();
	navigateTo("/");
}
async function userProfiles() {
	navigateTo("/user_profiles");
}

async function modifyProfile() {
	navigateTo("/modifyProfile");
}
</script>
