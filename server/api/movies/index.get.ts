import fs from "fs";

export default defineEventHandler(async (event) => {
  // TODO: check auth
  const moviesDir = useRuntimeConfig().moviesDir;
  return fs.readdirSync(moviesDir);
});
