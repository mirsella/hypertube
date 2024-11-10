import fs from "fs";

export default defineEventHandler(async (event) => {
  // TODO: check auth
  const moviesDir = useRuntimeConfig().moviesDir;
  let promises = fs.readdirSync(moviesDir).map((name) => {
    let id = name.replace(/\.mp4$/, "");
    return $fetch(`/api/movies/${id}`);
  });
  return Promise.all(promises);
});
