import { XMLParser } from "fast-xml-parser";
import { getServerSession, getToken } from "#auth";

const BASE_URL = "https://api.themoviedb.org/3/";

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
    if (!event.context.params?.id) {
      throw createError({
        statusCode: 400,
        statusMessage: "id parameter is required",
      });
    }
    const id = event.context.params?.id;

    //Add Movie to WatchedMovies User list
    await db
      .update(tables.users)
      .set({
        watchedMovies: sql`array_append(${tables.users.watchedMovies}, ${id})`,
      })
      .where(
        and(
          eq(tables.users.email, token.email),
          sql`NOT (${id} = ANY(${tables.users.watchedMovies}))`,
        ),
      );

    //Fetch movie infos
    const response = await fetch(
      `${BASE_URL}find/${id}` +
        `?external_source=imdb_id` +
        `&api_key=${config.tmdbApiKey}`,
    );
    const resData = await response.json();

    if (!resData.movie_results || resData.movie_results.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `No movie found with IMDb ID: ${id}`,
      });
    }

    //Fetch movie credits
    const resCredits = await fetch(
      `${BASE_URL}movie/${resData.movie_results[0].id}/credits` +
        `?api_key=${config.tmdbApiKey}`,
    );
    const credits = await resCredits.json();

    //Fetch movie details
    const resDetails = await fetch(
      `${BASE_URL}movie/${resData.movie_results[0].id}` +
        `?api_key=${config.tmdbApiKey}`,
    );
    const details = await resDetails.json();

    const movie_infos = {
      ...resData.movie_results[0],
      tagline: details.tagline,
      runtime: details.runtime,
      cast: credits.cast.filter(
        (a: any) => a.known_for_department === "Acting" && a.order <= 10,
      ),
      director: credits.crew.filter((a: any) => a.job === "Director"),
      writing: [
        ...credits.crew.filter((a: any) => a.job === "Screenplay"),
        credits.crew.filter((a: any) => a.job === "Novel")[0],
      ],
      producers: credits.crew.filter(
        (a: any) => a.job === "Executive Producer",
      ),
      production_companies: details.production_companies,
    };

    //Fetch Numbers of comments
    const headers = getRequestHeaders(event) as HeadersInit;
    const resComments = await $fetch<{ length: number }>(
      `http://localhost:3000/api/movies/${id}/comments`,
      { headers },
    );
    movie_infos.num_comments = resComments.length;

    //Fetch available subtitles
    const resSubtitles = await $fetch(
      `http://localhost:3000/api/movies/${id}/subtitles`,
      { headers },
    );
    movie_infos.available_subtitles = resSubtitles;

    //Fetch torrents from title

    const resTorrents = await fetch(
      `http://${config.jackettUrl}:9117/api/v2.0/indexers/all/results/torznab/api` +
        `?apikey=${config.jackettApiKey}` +
        `&t=movie&q=${encodeURI(movie_infos?.title)}` +
        `&year=${movie_infos.release_date.slice(0, 4)}` +
        `&cat=2000`,
    );

    if (!resTorrents.ok) {
      throw createError({
        statusCode: resTorrents.status,
        statusMessage: `Jackett API error: ${resTorrents.statusText}`,
      });
    }

    const torrents = new XMLParser({ ignoreAttributes: false }).parse(
      await resTorrents.text(),
    );

    if (torrents.error) {
      throw createError({
        statusCode: torrents.error?.["@_code"],
        statusMessage: `Jackett: ${torrents?.error?.["@_description"]}`,
      });
    }
    if (!torrents?.rss?.channel?.item) {
      throw createError({
        statusCode: 404,
        statusMessage: "No torrents found for this movie",
      });
    }

    //Filter,sort,format torrents results
    movie_infos.torrents = torrents?.rss?.channel?.item
      .filter(
        (a: any) =>
          a["guid"].split(":")[0] === "magnet" &&
          parseInt(
            a["torznab:attr"].find((a: any) => a["@_name"] === "seeders")?.[
              "@_value"
            ],
          ) >= 1 &&
          (a["torznab:attr"].find((a: any) => a["@_name"] === "imdbid")?.[
            "@_value"
          ] === id ||
            (movie_infos.title
              .toLowerCase()
              .split(/\s+/)
              .every((splitTitle: string) =>
                a?.title?.toLowerCase().includes(splitTitle),
              ) &&
              a?.title.includes(movie_infos.release_date.split("-")[0]))),
      )
      .sort(
        (a: any, b: any) =>
          parseInt(
            b["torznab:attr"].find((a: any) => a["@_name"] === "seeders")?.[
              "@_value"
            ],
          ) -
          parseInt(
            a["torznab:attr"].find((a: any) => a["@_name"] === "seeders")?.[
              "@_value"
            ],
          ),
      )
      .slice(0, 5)
      .map((t: any) => ({
        indexer: t.jackettindexer["#text"],
        title: t.title,
        magnet: t["guid"],
        seeders: parseInt(
          t["torznab:attr"].find((a: any) => a["@_name"] === "seeders")?.[
            "@_value"
          ],
        ),
        description: t["title"],
        size: t["size"],
      }));

    if (movie_infos.torrents.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: "No torrents found for this movie",
      });
    }

    return movie_infos;
  } catch (error) {
    console.error("Error in movie/id search:", error);
    return error;
  }
});
