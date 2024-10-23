<script setup lang="ts">
let id = useRoute().params.id as string;
if (id === "default") id = "ZGVhZHBvb2wgJiB3b2x2ZXJpbmUK";
const title = atob(id);
// TODO: use mediasource api to stream the movie
const infos = useFetch(`/api/movies/${id}`);
const comments = useFetch(`/api/movies/${id}/comments`);
</script>

<template>
  <div class="flex justify-center flex-wrap mx-auto max-w-7xl px-8 space-y-4">
    <p class="w-full text-center font-bold text-xl">{{ title }}</p>
    <div class="w-full my-4">
      <ClientOnly>
        <video
          :src="`/api/movies/${id}/stream`"
          class="rounded-lg shadow-sm shadow-primary w-full"
          controls
          autoplay
        ></video>
      </ClientOnly>
    </div>
    <div class="card bg-base-100 shadow-sm shadow-primary w-full">
      <div class="card-body">
        <!-- TODO: implement -->
        <p>information on the movie from /api/movies/:id</p>
        {{ infos.data }}
      </div>
    </div>
    <div class="card bg-base-100 shadow-sm shadow-secondary w-full">
      <div class="card-body">
        <p class="card-title">Comments</p>
        <div class="flex flex-nowrap items-end mx-10 gap-4 mt-2">
          <textarea
            class="textarea textarea-bordered textarea-lg grow"
          ></textarea>
          <button class="btn btn-secondary">send</button>
        </div>
        <div>
          {{ comments.data }}
        </div>
      </div>
    </div>
  </div>
</template>
