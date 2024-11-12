/*   return a movie’s name, id, imdB mark, production year, length, available subtitles,
number of comments */

const BASE_URL = 'https://api.themoviedb.org/3/';
const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  try {
    // Only allow GET requests
    if (event.method !== 'GET') {
      return createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed',
        message: 'Only GET requests are allowed for this endpoint'
      })
    }

    if (!event.context.params?.id) {
      return createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'id parameter is required'
      })
    }

    const id = event.context.params?.id
    //Fetch movie infos
    const response = await fetch(`${BASE_URL}find/${id}?external_source=imdb_id&api_key=${config.tmdbApiKey}`);
    const resData = await response.json();

    if (!resData.movie_results || resData.movie_results.length === 0) {
      throw createError({
        statusCode: 404,
        message: `No movie found with IMDb ID: ${id}`
      })
    }

    const movie_infos = resData.movie_results[0]

    //Fetch torrents from title
    const resTorrents = await fetch(`http://localhost:9117/api/v2.0/indexers/all/results/?apikey=${config.jackettApiKey}&Query=${encodeURI(movie_infos?.title)}&Category=2000`)

    if (!resTorrents.ok) {
      throw createError({
        statusCode: resTorrents.status,
        message: `Jackett API error: ${resTorrents.statusText}`
      })
    }

    const torrents = await resTorrents.json()

    //Filter,sort,format torrents results
    movie_infos.torrents = Object.values(torrents.Results)
      .filter((a: any) => a.MagnetUri !== null)
      .sort((a: any, b: any) => b.Seeders - a.Seeders)
      .slice(0, 5)
      .map((t: any) => ({ magnet: t.MagnetUri, seeders: t.Seeders, description: t.Description, size: t.Size }));

    return movie_infos
    // TODO:  add imdb_mark ?  lengths ?  available subtiltes ? number of comments ?
  } catch (error) {
    console.error('Error in movie id search:', error)
    // TODO: better error code and message (404 if the imdb isn't found, 500 for api error...)
    return createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to process movie id search request'
    })
  }
})
