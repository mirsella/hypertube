<template>
    <div class="flex flex-col md:flex-row">
        <!-- Sidebar Menu -->
        <div
            class="w-full md:w-1/4 h-auto md:h-screen bg-[color-mix(in oklch,currentColor 35%,#0000)] p-4">
            <ul class="menu bg-base-200 p-4 rounded-box">
                <li>
                    <a @click="activeForm = 'password'">{{
                        $t("modifyProfiles.changePassword")
                    }}</a>
                </li>
                <li>
                    <a @click="activeForm = 'username'">{{
                        $t("modifyProfiles.changeUsername")
                    }}</a>
                </li>
                <!-- "Change Email" option visible mais désactivée si invisible est false -->
                <li>
                    <a
                        @click="invisible && (activeForm = 'email')"
                        :class="{
                            'text-gray-400 cursor-not-allowed text-red-500': !invisible,
                            'text-black-500': invisible,
                        }">
                        {{ $t("modifyProfiles.changeEmail") }}
                    </a>
                </li>

                <li>
                    <a @click="activeForm = 'name'">{{ $t("modifyProfiles.changeName") }}</a>
                </li>
                <li>
                    <a @click="activeForm = 'picture'">{{ $t("modifyProfiles.changePicture") }}</a>
                </li>
            </ul>
        </div>

        <!-- Main Content -->
        <div class="w-full md:w-3/4 p-4">
            <div v-if="activeForm === 'password'">
                <userPassword :email="email" />
            </div>

            <div v-if="activeForm === 'username'">
                <userUsername :username="username" :email="email" />
            </div>

            <div v-if="activeForm === 'email' && invisible === true">
                <userMail :email="email" :username="username" />
            </div>

            <div v-if="activeForm === 'name'">
                <userName :firstname="firstname" :lastname="lastname" :email="email" />
            </div>

            <div v-if="activeForm === 'picture'">
                <userPicture :picture="picture" :email="email" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const activeForm = ref("password");
const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch("/api/token", { headers });
const { t, locale } = useI18n();
const data = reactive(useAuth());
const { status, signIn, signOut } = useAuth();
const username = ref("");
const email = ref("");
const firstname = ref("");
const lastname = ref("");
const invisible = ref(false);
const picture = ref("");
const { $eventBus } = useNuxtApp() as any;

onMounted(async () => {
    // const savedLanguage = localStorage.getItem("preferredLanguage");

    $eventBus.emit("CompleteProfil", true);

    try {
        if (!token.value) {
            throw new Error("Token is null");
        }
        const response = await $fetch<{
            message: string;
            user: {
                email: string;
                firstname: string;
                lastname: string;
                username: string;
                picture: string | null;
            };
            providers: string[];
            status: number;
        }>("/api/users/profil", {
            method: "POST",
            body: {
                email: token.value.email,
            },
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });

        // console.log(response.providers);
        // console.log(response.user.email);
        // console.log("picture ", response.user.picture);

        username.value = response.user.username;
        email.value = response.user.email;
        firstname.value = response.user.firstname;
        lastname.value = response.user.lastname;
        picture.value = response.user.picture || "";

        console.log(response.providers.length);
        if (response.providers.length === 1 && response.providers.includes("credentials")) {
            console.log("Only credentials");
            invisible.value = true;
        }

        console.log(response);
    } catch (error) {
        console.error(error);
    }
    // get update from other components
    await updateName();
    await updateUsername();
    await updateMail();
    await updatePicture();
});

async function updateUsername() {
    $eventBus.on("UpdateUsername", (payload: { username: string; email: string }) => {
        if (!payload.username) {
            return;
        }
        username.value = payload.username;
        email.value = payload.email;
    });
}

async function updateMail() {
    $eventBus.on("UpdateMail", (payload: { email: string }) => {
        if (!payload.email) {
            return;
        }
        email.value = payload.email;
    });
}

async function updateName() {
    $eventBus.on(
        "UpdateName",
        (payload: { firstname: string; lastname: string; email: string }) => {
            if (!payload.firstname || !payload.lastname) {
                return;
            }
            lastname.value = payload.lastname;
            firstname.value = payload.firstname;
            email.value = payload.email;
        }
    );
}

async function updatePicture() {
    $eventBus.on("UpdatePicture", (payload: { picture: string; email: string }) => {
        if (!payload.picture || !payload.email) {
            return;
        }
        picture.value = payload.picture;
        email.value = payload.email;
    });
}

onBeforeUnmount(() => {
    $eventBus.off("UpdateUsername", updateUsername);
    $eventBus.off("UpdateMail", updateMail);
    $eventBus.off("UpdateName", updateName);
});
</script>
