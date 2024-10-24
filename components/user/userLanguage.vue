<template>
  <div class="flex items-center space-x-4">
    <label class="text-gray-700">Select your language:</label>
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-outline btn-primary">
        {{ selectedLanguage }}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06-.02l3.69 3.69 3.69-3.69a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 01-.02-1.06z" clip-rule="evenodd" />
        </svg>
      </label>
      <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
        <li @click="selectLanguage('English')"><a>English</a></li>
        <li @click="selectLanguage('French')"><a>French</a></li>
        <li @click="selectLanguage('Spanish')"><a>Spanish</a></li>
        <li @click="selectLanguage('German')"><a>German</a></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Variable réactive pour stocker la langue sélectionnée
const selectedLanguage = ref('English'); // Par défaut : Anglais

// Fonction pour changer la langue sélectionnée
const selectLanguage = (language) => {
  selectedLanguage.value = language;
  // Stocker la langue préférée dans localStorage
  localStorage.setItem('preferredLanguage', language);
};

// Restaurer la langue préférée depuis localStorage au chargement
onMounted(() => {
  const savedLanguage = localStorage.getItem('preferredLanguage');
  if (savedLanguage) {
    selectedLanguage.value = savedLanguage;
  }
});
</script>

<style scoped>
/* Ajouter des styles spécifiques si nécessaire */
</style>
