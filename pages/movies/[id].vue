<script setup lang="ts">
let id = useRoute().params.id as string;
if (id === "default") id = "tt31050020";

const { data: infos } = useFetch(`/api/movies/${id}`);
const { data: subtitles } = useFetch(`/api/movies/${id}/subtitles`);
const { data: comments, refresh: refresh_comments } = useFetch(
  `/api/movies/${id}/comments`,
);

const comment_textarea = ref("");
async function send_comment() {
  if (!comment_textarea.value) return;
  await $fetch(`/api/movies/${id}/comments`, {
    method: "POST",
    body: {
      content: comment_textarea.value,
    },
  });
  refresh_comments();
  comment_textarea.value = "";
}

const player = ref<HTMLVideoElement>();
onMounted(() => {
  if (player.value) player.value.volume = 0.1;
});
</script>

<template>
  <div class="flex justify-center flex-wrap mx-auto max-w-7xl px-8 space-y-4">
    <p class="w-full text-center font-bold text-xl">{{ infos.title }}</p>
    <div class="w-full my-4">
      <video
        :src="`/api/movies/${id}/stream`"
        ref="player"
        class="rounded-lg shadow-sm shadow-primary w-full"
        controls
        autoplay
      >
        <track
          v-for="sub in subtitles"
          kind="subtitles"
          :label="sub"
          :srclang="sub"
          :src="`/api/movies/${id}/subtitles/${sub}`"
        />
      </video>
    </div>
    <div class="card bg-base-100 shadow-sm shadow-primary w-full">
      <div class="card-body">
        <!-- TODO: implement -->
        <p>information on the movie from /api/movies/:id</p>
        {{ infos }}
      </div>
    </div>
    <div class="card bg-base-100 shadow-sm shadow-secondary w-full">
      <div class="card-body">
        <p class="card-title">Comments</p>
        <div class="flex flex-nowrap items-end mx-10 gap-4 mt-2">
          <textarea
            v-model="comment_textarea"
            class="textarea textarea-bordered textarea-lg grow"
            maxlength="1024"
          ></textarea>
          <button
            class="btn btn-secondary"
            :class="{ 'btn-disabled': !comment_textarea.length }"
            @click="send_comment"
          >
            send
          </button>
        </div>
        <div>
          <!-- TODO: add delete button, change color, and make it chat-end if the -->
          <!-- user is the current user -->
          <div v-for="comment of comments" class="chat chat-start">
            <div class="chat-header text-lg ml-1">
              {{ comment.users?.name || "deleted" }}:
            </div>
            <div class="chat-bubble chat-bubble-secondary text-lg">
              {{ comment.comments.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
