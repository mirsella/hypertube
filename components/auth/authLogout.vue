<template>

<div class="navbar bg-primary text-primary-content">
    <button class="btn btn-ghost text-xl">daisyUI</button>
    <div class="flex-grow"></div>
    <button @click="handleSignOut" class="btn btn-error">Sign Out</button>
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

</script>
