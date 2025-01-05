<template>
    <div>
        <label for="password" class="block text-sm font-medium leading-6 text-gray-900">{{
            $t("modifyProfiles.modifyPassword")
        }}</label>
        <div class="mt-2">
            <label class="input input-bordered flex items-center gap-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    class="h-4 w-4 opacity-70">
                    <path
                        fill-rule="evenodd"
                        d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                        clip-rule="evenodd" />
                </svg>
                <input
                    id="password"
                    v-model="password"
                    name="password"
                    type="password"
                    placeholder="********"
                    required
                    class="grow" />
            </label>
            <small :class="isPasswordValid ? 'text-green-500' : 'text-red-500'">
                {{
                    isPasswordValid
                        ? $t("modifyProfiles.PasswordValid")
                        : $t("modifyProfiles.CondtionsPassword")
                }}
            </small>
        </div>
        <button
            type="submit"
            :disabled="!isPasswordValid"
            :class="[
                'btn w-full',
                !isPasswordValid ? 'bg-red-500 text-white cursor-not-allowed' : 'btn-primary',
            ]"
            @click="submit">
            {{ $t("modifyProfiles.Submit") }}
        </button>
    </div>
    <p>{{ message }}</p>
</template>

<script setup lang="ts">
const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch("/api/token", { headers });

const password = ref("");
const message = ref("");
const isPasswordValid = computed(() => validatePassword(password.value));

const props = defineProps({
    email: String,
});

const email = ref(props.email);

function validatePassword(password: string) {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

async function submit() {
    try {
        console.log("password", password.value);
        console.log("email", email.value);
        const response = await $fetch("/api/users/modify/password", {
            method: "POST",
            body: {
                password: password.value,
                email: email.value,
            },
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });
        message.value = "Password updated successfully";
    } catch (error) {
        console.error("Erreur lors de la mise à jour du nom d'utilisateur :", error);
    }
}
</script>
