<script setup lang="ts">
let movie_id = useRoute().params.id as string;
if (movie_id === "default") movie_id = "tt1431045";

const headers = useRequestHeaders(["cookie"]) as HeadersInit;
const { data: infos, error: infos_error } = await useLazyFetch(
  `/api/movies/${movie_id}`,
  { headers },
);
const { data: user } = await useFetch(`/api/users/me`, { headers });
const { data: subtitles } = await useFetch(
  `/api/movies/${movie_id}/subtitles`,
  { headers },
);
const { data: comments, refresh: refresh_comments } = await useFetch(
  `/api/movies/${movie_id}/comments`,
  { headers },
);

if (infos_error.value) throw infos_error.value;

const player = ref<HTMLVideoElement>();
watch(player, (newPlayer, oldPlayer) => {
  if (oldPlayer === undefined && newPlayer) {
    newPlayer.volume = 0.1;
  }
});

function video_play() {
  if (player.value) {
    const lang = localStorage["preferredLanguage"];
    for (let track of player.value.textTracks) {
      if (track.label === lang.slice(0, 2).toLowerCase()) {
        console.log("found subtitle for", lang, track);
        track.mode = "showing";
      }
    }
  }
}

const error = ref("");
function video_error() {
  if (import.meta.client) {
    error.value = document.querySelector("video")?.error?.message || "";
  }
}

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
  <div class="py-4">
    <!-- Torrent Fetch error -->
    <div v-if="infos_error" class="flex justify-center my-12">
      <p class="text-lg line-clamp-3">{{ $t("movies.stateFetchError") }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="!infos && !infos_error" class="flex justify-center my-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div
      v-if="infos"
      class="flex justify-center flex-wrap mx-auto max-w-7xl px-8 space-y-4"
    >
      <p class="w-full text-center font-bold text-xl">{{ infos?.title }}</p>
      <p v-show="error" class="text-error text-xl font-bold">{{ error }}</p>
      <div class="w-full my-4">
        <video
          ref="player"
          class="rounded-lg shadow-md shadow-primary w-full"
          controls
          :src="`/api/movies/${movie_id}/stream`"
          autoplay
          :onerror="video_error()"
          :onplay="video_play()"
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

      <div class="card bg-base-100 shadow-md shadow-secondary w-full">
        <div class="card card-side card-compact card-body">
          <figure>
            <img
              :src="`https://image.tmdb.org/t/p/w500${infos.poster_path}`"
              alt="poster"
            />
          </figure>
          <div class="card-body">
            <p>{{ infos.overview }}</p>
            <p>
              {{ $t("movies.ReleaseDate") }}:
              {{ new Date(infos.release_date).toDateString() }}
            </p>
            <p>{{ $t("movies.Runtime") }}: {{ infos.runtime }}m</p>
            <p>
              note: {{ infos.vote_average }}/10 ({{ infos.vote_count }} votes)
            </p>
            <p v-if="infos.director && infos.director[0]">
              {{ $t("movies.Director") }}: {{ infos.director[0].name }}
            </p>
            <p>
              {{ $t("movies.Companies") }}:
              {{
                infos.production_companies.map((e: any) => e.name).join(", ")
              }}
            </p>
          </div>
        </div>
        <div class="flex flex-wrap justify-evenly gap-4 p-4">
          <div
            v-for="cast in infos.cast.sort(
              (a: any, b: any) => b.popularity - a.popularity,
            )"
            class="card card-compact min-w-40 w-1/6 bg-base-200"
          >
            <figure>
              <img
                :src="`https://media.themoviedb.org/t/p/w500${cast.profile_path}`"
                alt="poster"
              />
            </figure>
            <p class="card-title mx-auto mt-1">{{ cast.name }}</p>
            <div class="card-body !pt-2 gap-0">
              <p>
                {{ $t("movies.Character") }}: <b>{{ cast.character }}</b>
              </p>
              <p>{{ $t("movies.Popularity") }}: {{ cast.popularity }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-md shadow-secondary w-full">
        <div class="card-body">
          <p class="card-title">{{ $t("movies.Comments") }}</p>
          <div class="flex md:flex-nowrap flex-wrap items-end gap-4 mt-2">
            <textarea
              v-model="comment_textarea"
              class="textarea textarea-bordered grow"
              maxlength="1024"
              :placeholder="$t('movies.AddAComment')"
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
            <div
              v-for="comment of comments"
              class="chat"
              :class="[
                comment.comments.authorId == user?.id
                  ? 'chat-end'
                  : 'chat-start',
              ]"
            >
              <div class="chat-header text-lg ml-1">
                user <b>{{ comment.users?.username || "deleted" }}</b> on
                <ClientOnly>
                  {{
                    new Date(comment.comments.updated_at).toLocaleDateString()
                  }}:
                </ClientOnly>
              </div>
              <div class="chat-bubble chat-bubble-secondary text-lg p-0">
                <input
                  type="text"
                  class="p-2 outline-none bg-transparent dark:text-white"
                  :disabled="comment.comments.authorId !== user?.id"
                  v-model="comments_input[comment.comments.id]"
                />
              </div>
              <div
                v-if="comment.comments.authorId == user?.id"
                class="chat-image"
              >
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
  </div>
</template>
