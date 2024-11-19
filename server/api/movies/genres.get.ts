const BASE_URL = "https://api.themoviedb.org/3/";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  try {
    // Fetch setup data
    const response = await fetch(
      `${BASE_URL}genre/movie/list?api_key=${config.tmdbApiKey}`,
    );
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error in genre fetching:", error);
    return createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Failed to process movie genres request",
    });
  }
});
