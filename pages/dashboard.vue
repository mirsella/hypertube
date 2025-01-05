<template>
  <div>
    <button @click="changeLanguage('fr')">Français</button>
    <button @click="changeLanguage('en')">English</button>
    <button @click="changeLanguage('es')">Español</button>
    <button @click="changeLanguage('es')">Español</button>
    <button @click="changeLanguage('es')">Español</button>
  </div>
</template>

<script setup lang="ts">
const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch("/api/token", { headers });

const data = reactive(useAuth());
const { $eventBus } = useNuxtApp() as any;

const { t, locale } = useI18n() as any;

function changeLanguage(lang: string) {
  locale.value = lang;

  console.log("Langue actuelle après changement:", locale.value);
}

onMounted(() => {
  $eventBus.emit("CompleteProfil", true);
});
</script>
