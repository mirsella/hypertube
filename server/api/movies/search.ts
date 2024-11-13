const BASE_URL = 'https://api.themoviedb.org/3/';
const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    try {
        // Get all query parameters
        const query = getQuery(event)

        // Validate query parameters
        const searchParams = {
            page: Number(query.page) || 1,
            title: (query.title as string) || "",
        }

        let popularOrSearch = 'search/movie'

        if (!searchParams.title) {
            popularOrSearch = 'movie/popular'
        };


        const response = await fetch(`${BASE_URL}${popularOrSearch}`
            + `?api_key=${config.tmdbApiKey}`
            + `&query=${searchParams.title}`
            + `&include_adult=false`
            + `&page=${searchParams.page}`);
        const data = await response.json();


        // Add imdb_id
        if (data.results) {
            for (const element of data.results) {
                const resImdbID = await fetch(`${BASE_URL}movie/${element.id}/external_ids`
                    + `?api_key=${config.tmdbApiKey}`);
                const external_ids = await resImdbID.json()
                element.imdb_id = external_ids.imdb_id
            };
        }

        // Remove if imdb_id not found
        data.results = data.results.filter((movie: any) => movie.imdb_id !== null);

        return data;

    } catch (error) {
        console.error('Error in movie search:', error)
        return createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Failed to process movie search request'
        })
    }
})