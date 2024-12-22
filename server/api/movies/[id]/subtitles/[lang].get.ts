import { parse, stringify } from "subtitle";
import stream from "stream";
import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session) throw createError({ statusCode: 401 });

  const lang = getRouterParam(event, "lang");
  const id = getRouterParam(event, "id");
  if (!lang || !id || lang.length != 2) throw createError({ statusCode: 400 });

  const subtitles = await opensubtitles_client.subtitles({
    imdb_id: id,
    languages: lang,
  });
  let best;
  for (const sub of subtitles.data) {
    if (!best) {
      best = sub;
      continue;
    }
    if (sub.attributes.votes > best.attributes.votes) best = sub;
    else if (sub.attributes.download_count > best.attributes.download_count)
      best = sub;
  }

  const subtitle = await opensubtitles_client.download({
    file_id: best.attributes.files[0].file_id,
  });

  const srt = await $fetch(subtitle.link);
  const srtstream = stream.Readable.from(srt);
  return srtstream.pipe(parse()).pipe(stringify({ format: "WebVTT" }));
});
