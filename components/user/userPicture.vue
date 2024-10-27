<template>
	<div>
		<div class="avatar">
			<div class="w-24 rounded-full">
				<img
					:src="preview"
					alt="Image"
					v-if="preview" />
			</div>
		</div>
		<p>{{ message }}</p>
	</div>

	<div class="flex flex-col items-center gap-4 p-6">
		<label
			class="w-full max-w-xs cursor-pointer flex flex-col items-center bg-base-200 rounded-lg p-4 border border-dashed border-gray-400 hover:border-primary hover:bg-base-100 transition duration-300 ease-in-out">
			<span class="text-base text-gray-500 mb-2">Click or drag a file to upload</span>
			<input
				type="file"
				class="hidden"
				@change="handleFileChange" />
		</label>
		<button
			@click="submitPhoto"
			class="btn btn-primary">
			Upload Photo
		</button>

		<div
			v-if="isUploading"
			class="w-full max-w-xs">
			<progress
				class="progress progress-primary w-full"
				:value="uploadProgress"
				max="100"></progress>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: token } = await useFetch("/api/token", { headers });

const props = defineProps<{
	picture?: string;
	email?: string;
}>();

const email = ref(props.email);
const message = ref("");
const picture = ref<File | null>(null); // Fichier brut pour l'upload
const preview = ref(props.picture); // Aperçu en Base64
const isUploading = ref(false);
const uploadProgress = ref(0);
const { $eventBus } = useNuxtApp();

function handleFileChange(event: Event) {
	const target = event.target as HTMLInputElement;
	if (target.files && target.files[0]) {
		// Vérifier la taille de l'image (par ex., 2 Mo maximum)
		if (target.files[0].size > 5 * 1024 * 1024) {
			alert("Le fichier est trop volumineux. Maximum 2 Mo.");
			return;
		}

		picture.value = target.files[0]; // Conserve le fichier brut pour l'upload

		// Création de l'aperçu en Base64 sans modifier `picture`
		const reader = new FileReader();
		reader.onload = e => {
			if (e.target?.result) {
				preview.value = e.target.result as string; // Affiche l'aperçu en Base64
			}
		};
		reader.readAsDataURL(picture.value); // Lire le fichier en Base64 pour l'aperçu seulement
	}
}

async function submitPhoto() {
	if (!picture.value) {
		alert("Please select a file before uploading!");
		return;
	}
	isUploading.value = true;

	try {
		const formData = new FormData();
		formData.append("file", picture.value); // Envoie le fichier brut
		formData.append("email", email.value as string);
		console.log(formData.get("file"));
		console.log(formData.get("email"));

		const response = await $fetch("/api/users/modify/picture", {
			method: "POST",
			body: formData,
			headers: {
				Authorization: `Bearer ${token.value}`,
			},
		});
		console.log(response);

		$eventBus.emit("UpdatePicture", {
			picture: response.file_path,
			email: email.value,
		});
		// Réinitialiser les valeurs après un upload réussi
		
		// picture.value = null;
		// preview.value = null;
		message.value = "Photo uploaded successfully!";
	} catch (error) {
		console.error("Erreur lors de l'upload de l'image :", error);
		message.value = "Error uploading file";
	} finally {
		isUploading.value = false;
	}
}
</script>
