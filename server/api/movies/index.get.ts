const BASE_URL = "https://api.themoviedb.org/3/";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  // Get all query parameters
  const query = getQuery(event);

  // Validate query parameters
  const searchParams = {
    page: Number(query.page) || 1,
    title: (query.title as string) || "",
  };

  try {
    const response = await fetch(
      `${BASE_URL}movie/popular` +
        `?api_key=${config.tmdbApiKey}` +
        `&include_adult=false` +
        `&page=${searchParams.page}`,
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
    // console.error("Error in movie search:", error);
    return createError({
      statusCode: 400,
      statusMessage: "Error fetching movies infos",
      message: "Failed to process movie search request",
    });
  }
});
