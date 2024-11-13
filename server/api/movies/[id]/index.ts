import { XMLParser } from "fast-xml-parser";

const BASE_URL = 'https://api.themoviedb.org/3/';
const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  try {
    // Only allow GET requests
    if (event.method !== 'GET') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed',
        message: 'Only GET requests are allowed for this endpoint'
      })
    }

    if (!event.context.params?.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'id parameter is required'
      })
    }

    const id = event.context.params?.id

    //Fetch movie infos
    const response = await fetch(`${BASE_URL}find/${id}`
      + `?external_source=imdb_id`
      + `&api_key=${config.tmdbApiKey}`);
    const resData = await response.json();

    if (!resData.movie_results || resData.movie_results.length === 0) {
      throw createError({
        statusCode: resData.status,
        message: `No movie found with IMDb ID: ${id}`
      })
    }

    //Fetch movie credits
    const resCredits = await fetch(`${BASE_URL}movie/${resData.movie_results[0].id}/credits`
      + `?api_key=${config.tmdbApiKey}`);
    const credits = await resCredits.json();

    //Fetch movie details
    const resDetails = await fetch(`${BASE_URL}movie/${resData.movie_results[0].id}`
      + `?api_key=${config.tmdbApiKey}`);
    const details = await resDetails.json();

    const movie_infos = {
      ...resData.movie_results[0],
      tagline: details.tagline,
      runtime: details.runtime,
      cast: credits.cast.filter((a: any) => (a.known_for_department === "Acting" && a.order <= 10)),
      director: credits.crew.filter((a: any) => a.job === "Director"),
      writing: [
        ...credits.crew.filter((a: any) => a.job === "Screenplay"),
        credits.crew.filter((a: any) => a.job === "Novel")[0],
      ],
      producers: credits.crew.filter((a: any) => a.job === "Executive Producer"),
      production_companies: details.production_companies
    }


    //Fetch torrents from title
    const resTorrents = await fetch("http://localhost:9117/api/v2.0/indexers/all/results/torznab/api"
      + `?apikey=${config.jackettApiKey}`
      + `&t=movie&q=${encodeURI(movie_infos?.title)}`
      + `&year=${movie_infos.release_date.slice(0, 4)}`
      + `&cat=2000`)

    if (!resTorrents.ok) {
      throw createError({
        statusCode: resTorrents.status,
        message: `Jackett API error: ${resTorrents.statusText}`
      })
    }

    const torrents = new XMLParser({ ignoreAttributes: false }).parse(await resTorrents.text())


    //Filter,sort,format torrents results
    movie_infos.torrents = torrents.rss.channel.item
      .filter((a: any) => a["guid"].split(':')[0] === "magnet"
        && parseInt(a["torznab:attr"].find((a: any) => a["@_name"] === "seeders")?.["@_value"]) > 5
        && a["torznab:attr"].find((a: any) => a["@_name"] === "imdbid")?.["@_value"] === id)
      .sort(
        (a: any, b: any) =>
          parseInt(b["torznab:attr"].find((a: any) => a["@_name"] === "seeders")?.["@_value"])
          - parseInt(a["torznab:attr"].find((a: any) => a["@_name"] === "seeders")?.["@_value"]))
      .slice(0, 5)
      .map((t: any) => ({
        magnet: t["guid"],
        seeders: parseInt(t["torznab:attr"].find((a: any) => a["@_name"] === "seeders")?.["@_value"]),
        description: t["title"],
        size: t["size"]
      })
      );

    return movie_infos
    // TODO:  add available subtiltes ? number of comments ?
  } catch (error) {
    console.error('Error in movie/id search:', error)
    return error;
  }
})