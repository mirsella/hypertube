<script setup lang="ts">
let movie_id = useRoute().params.id as string;
if (movie_id === "default") movie_id = "tt1431045";

const { data: infos } = useFetch(`/api/movies/${movie_id}`);
const { data: subtitles } = useFetch(`/api/movies/${movie_id}/subtitles`);
const { data: comments, refresh: refresh_comments } = useFetch(
  `/api/movies/${movie_id}/comments`,
);

const player = ref<HTMLVideoElement>();
onMounted(() => {
  if (player.value) player.value.volume = 0.1;
});

const comment_textarea = ref("");
const comments_input = ref<{ [id: string]: string }>({});
watchEffect(() =>
  comments.value?.forEach(
    (v) => (comments_input.value[v.comments.id] = v.comments.content),
  ),
);
async function send_comment() {
  if (!comment_textarea.value) return;
  $fetch(`/api/movies/${movie_id}/comments`, {
    method: "POST",
    body: {
      content: comment_textarea.value,
    },
  }).then(() => refresh_comments());
  comment_textarea.value = "";
}
async function delete_comment(comment_id: string) {
  await $fetch(`/api/comments/${comment_id}`, { method: "DELETE" });
  refresh_comments();
}
async function update_comment(comment_id: string) {
  await $fetch(`/api/comments/${comment_id}`, {
    method: "PATCH",
    body: { content: comments_input.value[comment_id], movie_id: movie_id },
  });
  refresh_comments();
}
</script>

<template>
  <div class="flex justify-center flex-wrap mx-auto max-w-7xl px-8 space-y-4">
    <p class="w-full text-center font-bold text-xl">{{ infos.title }}</p>
    <div class="w-full my-4">
      <video
        :src="`/api/movies/${movie_id}/stream`"
        ref="player"
        class="rounded-lg shadow-md shadow-primary w-full"
        controls
        autoplay
      >
        <track
          v-for="sub in subtitles"
          kind="subtitles"
          :label="sub"
          :srclang="sub"
          :src="`/api/movies/${movie_id}/subtitles/${sub}`"
        />
      </video>
    </div>
    <div class="card card-side bg-base-100 shadow-md shadow-secondary w-full">
      <figure>
        <img
          :src="`https://image.tmdb.org/t/p/w500${infos.poster_path}`"
          alt="poster"
        />
      </figure>
      <div class="card-body">
        <!-- TODO: implement -->
        <!-- summary, casting (at least producer, director, main cast etc.), the production year, -->
        <!-- length, IMDb grade, a cover image and anything else relevant. -->
        <p>{{ infos.overview }}</p>
        <p>release date: {{ new Date(infos.release_date).toDateString() }}</p>
        <p>add rest of informations like casts when available</p>
      </div>
    </div>
    <div class="card bg-base-100 shadow-md shadow-secondary w-full">
      <div class="card-body">
        <p class="card-title">Comments</p>
        <div class="flex md:flex-nowrap flex-wrap items-end gap-4 mt-2">
          <textarea
            v-model="comment_textarea"
            class="textarea textarea-bordered grow"
            maxlength="1024"
            placeholder="add a comment..."
          ></textarea>
          <button
            class="btn btn-secondary"
            :class="{ 'btn-disabled': !comment_textarea.length }"
            @click="send_comment"
          >
            post
          </button>
        </div>
        <div class="mr-20">
          <!-- TODO: use real user id to compare if its our comment -->
          <div
            v-for="comment of comments"
            class="chat"
            :class="[true ? 'chat-end' : 'chat-start']"
          >
            <div class="chat-header text-lg ml-1">
              user <b>{{ comment.users?.name || "deleted" }}</b> on
              {{ new Date(comment.comments.updated_at).toLocaleDateString() }}:
            </div>
            <div class="chat-bubble chat-bubble-secondary text-lg p-0">
              <input
                type="text"
                class="p-2 outline-none bg-transparent"
                v-model="comments_input[comment.comments.id]"
              />
            </div>
            <!-- TODO: also use real user it here -->
            <div v-if="true" class="chat-image">
              <button
                v-show="
                  comments_input[comment.comments.id] !==
                  comment.comments.content
                "
                class="btn-success btn i-carbon-save"
                @click="update_comment(comment.comments.id)"
              ></button>
              <button
                @click="delete_comment(comment.comments.id)"
                class="btn-error btn i-carbon-trash-can"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
