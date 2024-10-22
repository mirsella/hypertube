export default defineEventHandler(async (event) => {
  // TODO: check auth
  const lang = getRouterParam(event, "lang");
  const base64 = getRouterParam(event, "id");
  if (!lang || !base64 || lang.length != 2)
    throw createError({ statusCode: 400 });
  const title = Buffer.from(base64, "base64").toString();

  const subtitles = await opensubtitles_client.subtitles({
    query: title,
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

  return subtitle.link;
});
