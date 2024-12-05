<template>
	<div class="container mx-auto p-4">
		<!-- Search Section -->
		<div class="mb-8">
			<input v-model="searchQuery" @input="debounceSearch" type="text" placeholder="Search movies..."
				class="input input-bordered w-full max-w-lg" />
		</div>

		<!-- Filters Section -->
		<div class="flex flex-wrap gap-4 mb-8">
			<!-- Sort Direction -->
			<select v-model="sortDirection" class="select select-bordered">
				<option value="asc">Ascending</option>
				<option value="desc">Descending</option>
			</select>

			<!-- Sort Options -->
			<select v-model="sortBy" class="select select-bordered">
				<option value="title">Name</option>
				<option value="vote_average">Rating</option>
				<option value="release_date">Release Year</option>
				<option value="popularity">Popularity</option>
			</select>

			<!-- Genre Filter -->
			<select v-model="selectedGenre" class="select select-bordered">
				<option value="">All Genres</option>
				<option v-for="genre in genres" :key="genre.id" :value="genre.id">
					{{ genre.name }}
				</option>
			</select>

			<!-- Year Filter -->
			<input v-model="yearFilter" type="number" placeholder="Year" class="input input-bordered w-24" />

		</div>

		<!-- Movies Grid -->
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
			<div v-for="movie in filteredMovies" :key="movie.id" class="card bg-base-100 shadow-xl"
				@click="sendToPlayer(movie)">
				<figure>
					<img :src="'https://image.tmdb.org/t/p/w500' + movie.poster_path" :alt="movie.title"
						class="w-full object-cover" />
				</figure>
				<div class="card-body">
					<div class="flex justify-between items-center">
						<div class="badge badge-primary">{{ movie.release_date?.split('-')[0] }}</div>
						<div class="badge badge-secondary">{{ movie.vote_average.toFixed(1) }}</div>
					</div>
					<h2 class="card-title text-base">{{ movie.title }}</h2>
				</div>
			</div>
		</div>

		<!-- Loading State -->
		<div v-if="loading" class="flex justify-center my-8">
			<span class="loading loading-spinner loading-lg"></span>
		</div>

		<!-- No More Movies State -->
		<div v-if="totalPages === page" class="flex justify-center my-8">
			<p class="text-sm line-clamp-3">No more movies</p>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import debounce from 'lodash/debounce'

// State
const config = useRuntimeConfig()
const searchQuery = ref('')
const movies = ref([])
const genres = ref([])
const loading = ref(false)
const page = ref(1)
const totalPages = ref(0)
const sortBy = ref('popularity')
const sortDirection = ref('desc')
const selectedGenre = ref('')
const yearFilter = ref('')

// Add scroll listener
onMounted(() => {
	window.addEventListener('scroll', handleScroll)
})

// Fetch genres on mount
onMounted(async () => {

	// Fetch setup data
	try {
		const resGenres = await fetch(
			`/api/movies/genres`
		)
		const gdata = await resGenres.json()
		genres.value = gdata.genres

		// Search Popular Movies
		searchMovies()

	} catch (error) {
		console.error('Error fetching setup data:', error)
	}
})

const sendToPlayer = async (movie) => {
	navigateTo({
		path: `/movies/${movie.imdb_id}`,
		query: {
			id: movie.id,
			title: movie.title
		},
	})
}

const addUniqueMovies = (existingMovies, newMovies) => {
	const uniqueMovies = [...existingMovies]
	const existingIds = new Set(existingMovies.map(m => m.id))

	newMovies.forEach(movie => {
		if (!existingIds.has(movie.id)) {
			uniqueMovies.push(movie)
			existingIds.add(movie.id)
		}
	})

	return uniqueMovies
}
// Search movies function
const searchMovies = async () => {
	try {
		const { data: response } = await useFetch(`/api/movies/search`
			+ `?title=${searchQuery.value}`
			+ `&page=${page.value}`)
		const data = response.value

		if (page.value === 1) {
			totalPages.value = data.total_pages
			movies.value = data.results
		} else {
			movies.value = addUniqueMovies(movies.value, data.results)
		}
	} catch (error) {
		console.error('Error searching movies:', error)
	} finally {
		loading.value = false
	}
}

// Debounced search
const debounceSearch = debounce(() => {
	sortBy.value = 'title'
	page.value = 1
	movies.value = []
	totalPages.value = 0
	searchMovies()
}, 1500)

// Infinite scroll handler
const handleScroll = () => {
	const bottomOfWindow =
		document.documentElement.scrollTop + window.innerHeight ===
		document.documentElement.offsetHeight

	if (!bottomOfWindow || loading.value || totalPages.value == page.value) return

	page.value++
	loading.value = true
	searchMovies()
}

// Computed filtered and sorted movies
const filteredMovies = computed(() => {
	let filtered = [...movies.value]

	// Filter by genre
	if (selectedGenre.value) {
		filtered = filtered.filter(movie =>
			movie.genre_ids.includes(Number(selectedGenre.value))
		)
	}

	// Filter by year
	if (yearFilter.value) {
		filtered = filtered.filter(movie =>
			movie.release_date?.startsWith(yearFilter.value)
		)
	}

	// Sort movies
	filtered.sort((a, b) => {
		let comparison = 0

		switch (sortBy.value) {
			case 'popularity':
				comparison = a.popularity - b.popularity
				break
			case 'title':
				comparison = a.title.localeCompare(b.title)
				break
			case 'vote_average':
				comparison = a.vote_average - b.vote_average
				break
			case 'release_date':
				comparison = new Date(a.release_date) - new Date(b.release_date)
				break
		}

		return sortDirection.value === 'asc' ? comparison : -comparison
	})

	return filtered
})
</script>