import fsp from "fs/promises";
import fs from "fs";
import path from "path";

export default defineTask({
  meta: {
    description:
      "Remove movies that weren't watched in the last month in the configured directory",
  },
  async run() {
    const moviesDir = useRuntimeConfig().moviesDir;
    if (!fs.existsSync(moviesDir)) fs.mkdirSync(moviesDir);
    console.log(`Running remove_old_movies task on directory ${moviesDir}`);
    const month = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const files = await fsp.readdir(moviesDir);
    for (const file of files) {
      const filePath = path.join(moviesDir, file);
      const stats = await fsp.stat(filePath);
      if (stats.isFile()) {
        if (now - stats.atimeMs > month) {
          await fsp.unlink(filePath);
          console.log(`Deleted old movie: ${filePath}`);
        }
      }
    }

    console.log("Finished removing old movies");
    return { result: "ok" };
  },
});
