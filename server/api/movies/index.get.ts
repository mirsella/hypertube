const BASE_URL = "https://api.themoviedb.org/3/movie/popular";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  try {
    const response = await fetch(
      `${BASE_URL}` +
      `?api_key=${config.tmdbApiKey}` +
      `&include_adult=false`
    );
    const data = await response.json();

    // Add imdb_id
    if (data.results) {
      for (const element of data.results) {
        const resImdbID = await fetch(
          `${BASE_URL}movie/${element.id}/external_ids` +
          `?api_key=${config.tmdbApiKey}`,
        );
        const external_ids = await resImdbID.json();
        element.imdb_id = external_ids.imdb_id;
      }
    }

    return data;
  } catch (error) {
    console.error("Error in movie search:", error);
    return createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Failed to process movie search request",
    });
  }
});
