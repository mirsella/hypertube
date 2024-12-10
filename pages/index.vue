<script setup>
const { data: movies, status, } = useLazyFetch("/api/movies", {
    server: false,
})
</script>

<template>
    <div class="container mx-auto p-4">
        <div class="flex w-full flex-col">
            <div class="divider divider-start text-xl">Popular Movies</div>
        </div>

        <!-- Loading State -->
        <div v-if="status === 'pending'" class="flex justify-center my-8">
            <span class="loading loading-spinner loading-lg"></span>
        </div>
        <!-- Movies Grid -->
        <div v-else-if="movies?.results?.length" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <div v-for="movie in movies.results" :key="movie.id" class="card bg-base-100 shadow-xl">
                <figure>
                    <img :src="'https://image.tmdb.org/t/p/w500' + movie.poster_path" :alt="movie.title"
                        class="w-full object-cover" loading="lazy" />
                </figure>
                <div class="card-body">
                    <div class="flex justify-between items-center">
                        <div class="badge badge-primary">
                            {{ movie.release_date?.split('-')[0] }}
                        </div>
                        <div class="badge badge-secondary">
                            {{ movie.vote_average?.toFixed(1) }}
                        </div>
                    </div>
                    <h2 class="card-title text-base">{{ movie.title }}</h2>
                </div>
            </div>
        </div>
    </div>
</template>