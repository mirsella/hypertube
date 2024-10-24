<template>
	<div>
		<p>Chemin de l'image : {{ picture }}</p>

		<div class="avatar">
			<div class="w-24 rounded-full">
				<img
					:src="picture"
					alt="Image"
					v-if="picture" />
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

const props = defineProps<{
	picture?: string;
	email?: string;
}>();

const email = ref(props.email);
const message = ref("");
const picture = ref(props.picture);
const isUploading = ref(false);
const uploadProgress = ref(0);
// function for handling file change
function handleFileChange(event: Event) {
	const target = event.target as HTMLInputElement;
	if (target.files && target.files[0]) {
		picture.value = target.files[0];

		const reader = new FileReader(); // api for previewing image
		reader.onload = e => {
			if (e.target?.result) {
				picture.value = e.target.result as string;
			}
		};
		reader.readAsDataURL(picture.value);
	}
}

async function submitPhoto() {
	if (!picture.value) {
		alert("Please select a file before uploading!");
		return;
	}

	isUploading.value = true;

	// Simulation d'un upload avec une barre de progression
	for (let i = 0; i <= 100; i++) {
		await new Promise(resolve => setTimeout(resolve, 30));
		uploadProgress.value = i;
	}

	// Après l'upload, on garde l'image en tant que valeur de `picture`
	picture.value = URL.createObjectURL(picture.value);

	isUploading.value = false;
	alert("File uploaded successfully!");
}
</script>
