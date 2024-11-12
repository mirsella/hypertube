export default defineEventHandler(async (event) => {
  // TODO: check auth
  const id = getRouterParam(event, "id");
  const subtitles = await opensubtitles_client.subtitles({
    imdb_id: id,
  });
  const set = new Set<string>();
  subtitles.data.forEach((e: any) => set.add(e.attributes.language as string));
  return set
    .values()
    .toArray()
    .sort((a, b) => a.localeCompare(b));
});
