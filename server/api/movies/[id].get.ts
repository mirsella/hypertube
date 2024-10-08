export default defineEventHandler(async (event) => {
  let base64 = getRouterParam(event, "id");
  if (!base64) throw createError({ statusCode: 400 });
  const title = Buffer.from(base64, "base64").toString();
  // look if movie exists in fs, something like ./movies/{base64}.mp4, and send the file
  // if not, get the the torrent from jackett and start download, then send the file
  // we can download the torrent using a nitro tasks https://nitro.unjs.io/guide/tasks
});
