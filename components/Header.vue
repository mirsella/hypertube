<template>
    <div class="navbar bg-gray-900 text-gray-100 p-4 shadow-lg flex flex-wrap items-center">
        <div class="flex items-center space-x-2"></div>
        <div v-if="showAnimation" class="w-70 h-70">
            <!-- Adjust size if necessary -->
            <LottieAnimation :animationData="animationData" :loop="true" :autoplay="true" />
            <button v-if="completed_profil === true" @click="Search"
                class="btn btn-outline btn-accent text-gray-900 hover:bg-yellow-600 transition-all duration-300 flex items-center gap-2">
                <span class="w-5 h-5 i-carbon-search"> </span>
                {{ $t("boutton.Search") }}
            </button>
        </div>

        <div class="flex-grow"></div>
        <div class="space-x-4 flex flex-wrap">
            <div v-if="completed_profil === true" class="flex flex-wrap space-x-4">
                <button @click="userProfiles"
                    class="btn btn-warning text-gray-900 hover:bg-yellow-600 transition-all duration-300">
                    {{ $t("boutton.UserProfiles") }}
                </button>

                <button @click="modifyProfile"
                    class="btn btn-info text-gray-900 hover:bg-blue-600 transition-all duration-300">
                    {{ $t("boutton.ModifyProfiles") }}
                </button>
            </div>
            <button @click="handleSignOut"
                class="btn btn-error text-gray-200 hover:bg-red-600 transition-all duration-300">
                {{ $t("boutton.SignOut") }}
            </button>
            <userLanguage />
        </div>
    </div>
</template>
<!-- <p>data: {{ data }}</p>
<p>token: {{ token }}</p>
<p>cacfewfwefwefwfwa</p> -->

<script setup lang="ts">
const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch("/api/token", { headers });
const { status, signOut } = useAuth();
const data = useAuth();
const loggedIn = computed(() => status.value === "authenticated");
const completed_profil = ref(false);
import animationData from "~/assets/lottie/movie.json";
import LottieAnimation from "~/components/lotie/lotieAnimation.vue";
const { $eventBus } = useNuxtApp() as any;
const showAnimation = ref(true);
const { t, locale } = useI18n();
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
function Search() {
    navigateTo("/search");
}

onMounted(() => {
    //console.log("completed_profil:", completed_profil.value);
    //Show the nav bar only if the profile is completed
    checkCompletedProfile();

    $eventBus.on("CompleteProfil", (payload: any) => {
        checkCompletedProfile();
    });
});

onBeforeUnmount(() => {
    $eventBus.off("CompleteProfil", completed_profil);
});

async function checkCompletedProfile() {
    try {
        if (token.value === null) throw new Error("Token is null");
        const response = await $fetch<{ complete_profile: boolean }>("/api/users/completed", {
            method: "POST",
            body: {
                email: token.value.email,
            },
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });

        completed_profil.value = response.complete_profile;
        // console.log("completed_profil ===== :", response.complete_profile);
        // console.log(typeof response.complete_profile);
        // console.log("api completed", response.complete_profile);

        // console.log("completed_profil:", completed_profil.value); // Verifier la mise a jour de la valeur
    } catch (error) {
        console.error(error);
    }
}
</script>
