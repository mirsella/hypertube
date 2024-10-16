<template>
	<div class="navbar bg-gray-900 text-gray-100 p-4 shadow-lg">
		<!-- Logo or Title -->
		<button class="btn btn-ghost text-xl text-white hover:bg-gray-700 transition-all">
			daisyUI
		</button>

		<div class="flex-grow"></div>

		<div class="space-x-4">
			<button
				@click="handleSignOut"
				class="btn btn-error text-gray-200 hover:bg-red-600 transition-all duration-300">
				Sign Out
			</button>

			<button
				@click="userProfiles"
				class="btn btn-warning text-gray-900 hover:bg-yellow-600 transition-all duration-300">
				User Profiles
			</button>

			<button
				@click="Dashboard"
				class="btn btn-warning text-gray-900 hover:bg-yellow-600 transition-all duration-300">
				Dashboard
			</button>
			
			<button
				@click="modifyProfile"
				class="btn btn-info text-gray-900 hover:bg-blue-600 transition-all duration-300">
				Modify Profile
			</button>
		</div>
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
 function userProfiles() {
	navigateTo("/user_profiles");
}

 function modifyProfile() {
	navigateTo("/modify_profile");
}
 function Dashboard() {
	navigateTo("/Dashboard");
}
</script>
