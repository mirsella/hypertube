export default defineEventHandler(async (event) => {
  const base64 = getRouterParam(event, "id");
  if (!base64) throw createError({ statusCode: 400 });
  const title = Buffer.from(base64, "base64").toString();
  const subtitles = await opensubtitles_client.subtitles({
    query: title,
  });
  const set = new Set();
  subtitles.data.forEach((e: any) => set.add(e.attributes.language));
  return set.values().toArray();
});
