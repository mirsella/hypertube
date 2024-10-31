<template>
  <div>
<<<<<<< HEAD
    <p>{{ $t('welcomeDashboard') }}</p>
    <p>{{ $t('hello') }}</p>
    <p>{{ $t('howAreYou') }}</p>
=======
>>>>>>> 158282d (Fix some issues with languages)

    <button @click="changeLanguage('fr')">Français</button>
    <button @click="changeLanguage('en')">English</button>
  </div>
</template>

<script setup lang="ts">
const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch("/api/token", { headers });

const data = reactive(useAuth());
const { $eventBus } = useNuxtApp();

const { t, locale } = useI18n(); 

function changeLanguage(lang: string) {
  locale.value = lang; // Change la langue
	
  console.log("Langue actuelle après changement:", locale.value);
}

onMounted(() => {
	$eventBus.emit("CompleteProfil", true);
});


</script>
