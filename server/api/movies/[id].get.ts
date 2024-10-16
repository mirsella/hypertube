import fs from "fs";
import { Readable } from "node:stream";
import path from "path";
import { torrent_client } from "~/server/utils/webtorrent";

async function createReadStream(file: string): Promise<fs.ReadStream | null> {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(file);
    stream.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code !== "ENOENT") {
        console.error(`reading ${file}: ${err}`);
      }
      resolve(null);
    });
    stream.on("open", () => resolve(stream));
  });
}

export default defineEventHandler(async (event) => {
  const moviesDir = useRuntimeConfig().moviesDir;
  // path.basename to sanitize the input (path traversal attack)
  const base64 = path.basename(getRouterParam(event, "id") || "");
  if (!base64) throw createError({ statusCode: 400 });

  const filepath = path.join(moviesDir, base64 + ".mp4");
  const stream = await createReadStream(filepath);
  if (stream) {
    return sendStream(event, stream);
  }
  const title = Buffer.from(base64, "base64").toString();
  // TODO: get the magnet/torrent from jackett api instead, this is just for testing
  const magnet =
    "magnet:?xt=urn:btih:14E16CEA3FC987267A61DC8342E86916CEFCA9D3&dn=Deadpool+and+Wolverine+2024+MA+WEBRip+SDR+10Bit+1440p+DDP5.1+Atmos+HEVC-3Li&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.moeking.me%3A6969%2Fannounce&tr=udp%3A%2F%2Fexplodie.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fcoppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.zer0day.to%3A1337%2Fannounce";
  const torrent = torrent_client.add(magnet);
  const torrent_files = torrent.files.sort((a, b) => b.length - a.length);
  const biggest_file_stream = torrent_files[0].createReadStream();

  // TODO: download subtitles from opensubtitles
  // https://github.com/vankasteelj/opensubtitles.com

  // TODO: before returning the stream, we should run it through ffmpeg to convert it to mp4, and add subtitles
  // github.com/fluent-ffmpeg/node-fluent-ffmpeg

  return sendStream(event, new Readable().wrap(biggest_file_stream));
});
