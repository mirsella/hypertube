const BASE_URL = "https://api.themoviedb.org/3/";
import { getServerSession, getToken } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  const token = await getToken({ event });
  if (!session) {
    return { message: "User is not authenticated", status: 400 };
  }
  if (!token?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const config = useRuntimeConfig(event);

  try {
    // Get all query parameters
    const query = getQuery(event);

    // Validate query parameters
    const searchParams = {
      page: Number(query.page) || 1,
      title: (query.title as string) || "",
    };

    const response = await fetch(
      `${BASE_URL}search/movie` +
        `?api_key=${config.tmdbApiKey}` +
        `&query=${searchParams.title}` +
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

    // Remove if imdb_id not found
    data.results = data.results.filter(
      (movie: any) => movie.imdb_id !== null && movie.popularity > 30,
    );

    return data;
  } catch (error) {
    console.error("Error in movie search:", error);
    return createError({
      statusCode: 400,
      statusMessage: "Error fetching movies",
      message: "Failed to process movie search request",
    });
  }
});
