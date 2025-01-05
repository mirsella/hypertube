import { getServerSession } from "#auth";

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);
  if (!session) throw createError({ statusCode: 401 });

  if (process.env.NODE_ENV === "production" && process.env.CI) {
    return ["fr", "en"];
  }

  const id = getRouterParam(event, "id");
  const subtitles = await opensubtitles_client.subtitles({
    imdb_id: id,
  });
  const set = new Set<string>();
  subtitles.data.forEach((e: any) => set.add(e.attributes.language as string));

  return [...set].sort((a, b) => a.localeCompare(b));
});
