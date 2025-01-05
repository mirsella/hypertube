<template>
    <div class="flex items-center space-x-4">
        <div class="dropdown dropdown-end">
            <label
                tabindex="0"
                class="btn btn-outline bg-gray-900 text-white hover:bg-gray-700 transition-all">
                {{ selectedLanguage }}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06-.02l3.69 3.69 3.69-3.69a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 01-.02-1.06z"
                        clip-rule="evenodd" />
                </svg>
            </label>
            <ul
                tabindex="0"
                class="dropdown-content menu p-2 shadow bg-gray-900 text-white rounded-box w-52">
                <li @click="selectLanguage('English')"><a>English</a></li>
                <li @click="selectLanguage('French')"><a>French</a></li>
            </ul>
        </div>
    </div>
</template>

<script setup>
const selectedLanguage = ref("English");
const { t, locale } = useI18n(); // Récupère `t` et `locale` depuis `useI18n`

const selectLanguage = (language) => {
    selectedLanguage.value = language;
    locale.value = language === "English" ? "en" : "fr";
    localStorage.setItem("preferredLanguage", language); // Sauvegarde la langue préférée
};
onMounted(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage"); //
    if (savedLanguage) {
        selectedLanguage.value = savedLanguage;
        locale.value = savedLanguage === "English" ? "en" : "fr"; // Applique la langue restaurée
    }
});
</script>
