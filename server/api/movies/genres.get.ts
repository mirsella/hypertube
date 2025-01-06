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
    // Fetch setup data
    const response = await fetch(
      `${BASE_URL}genre/movie/list?api_key=${config.tmdbApiKey}`,
    );
    const data = await response.json();

    return data;
  } catch (error) {
    // console.error("Error in genre fetching:", error);
    return createError({
      statusCode: 400,
      statusMessage: "Error fetching genres",
      message: "Failed to process movie genres request",
    });
  }
});
