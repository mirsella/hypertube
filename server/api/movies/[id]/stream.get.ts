import ffmpeg from "fluent-ffmpeg";
import { execSync } from "child_process";
import os from "os";
import stream from "stream";
import fs from "fs";
import path from "path";
import WebTorrent from "webtorrent";
import { getServerSession } from "#auth";

let torrent_client: null | WebTorrent.Instance = null;

export default defineEventHandler(
  async (
    event,
  ): Promise<
    | stream.Readable
    | stream.Writable
    | stream.PassThrough
    | NodeJS.ReadableStream
  > => {
    const session = await getServerSession(event);
    if (!session) throw createError({ statusCode: 401 });

    const moviesDir = useRuntimeConfig(event).moviesDir;
    const headers = getRequestHeaders(event) as HeadersInit;
    const range = getHeader(event, "range");

    if (!fs.existsSync(moviesDir)) fs.mkdirSync(moviesDir);
    const id = getRouterParam(event, "id");
    if (!id)
      throw createError({ statusCode: 400, statusMessage: "no id given" });
    const filepath = path.join(moviesDir, id);

    // Handle range requests for existing files
    if (fs.existsSync(filepath)) {
      const stat = fs.statSync(filepath);
      const fileSize = stat.size;
      const mimeType = execSync(`file -b --mime-type '${filepath}'`).toString();

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;

        setResponseHeaders(event, {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize.toString(),
          "Content-Type": mimeType,
        });
        setResponseStatus(event, 206);

        return fs.createReadStream(filepath, { start, end });
      } else {
        setResponseHeaders(event, {
          "Content-Length": fileSize.toString(),
          "Content-Type": mimeType,
          "Accept-Ranges": "bytes",
        });
        return fs.createReadStream(filepath);
      }
    }

    const infos = await $fetch(`/api/movies/${id}`, { headers });
    if (!infos.torrents?.[0]) {
      throw createError({
        statusCode: 404,
        statusMessage: "no torrents found for this movie",
      });
    }

    if (!torrent_client) torrent_client = new WebTorrent();

    const get_magnet_id = (magnet: string): string => {
      return magnet.toLowerCase().match(/btih:[0-9a-z]+/)?.[0] as string;
    };
    const magnet_id = get_magnet_id(infos.torrents[0].magnet);
    let torrent = torrent_client.torrents.find((t) => {
      return get_magnet_id(t.magnetURI) === magnet_id;
    });
    if (!torrent) {
      console.log("starting torrent for", infos.title);
      torrent = torrent_client.add(infos.torrents[0].magnet);
    }
    if (!torrent.ready) {
      await new Promise<void>((resolve) => {
        torrent.on("ready", () => resolve());
      });
    }
    const biggest_files = torrent.files.sort((a, b) => b.length - a.length);
    biggest_files.forEach((t, i) => {
      if (i !== 0) t.deselect();
    });
    const biggest_file = biggest_files[0];
    biggest_file.select();
    const biggest_file_path = torrent.path + "/" + biggest_file.path;
    const biggest_file_path_converted = biggest_file_path + ".converted";
    let biggest_file_type;
    if (biggest_file.name.endsWith(".mp4")) biggest_file_type = "mp4";
    if (biggest_file.name.endsWith(".webm")) biggest_file_type = "webm";

    if (biggest_file_type !== "mp4" && biggest_file_type !== "webm") {
      console.log("converting", biggest_file.name, "to webm");
      let convert_stream = convert_to_webm(
        // @ts-ignore: webtorrent file implement asyncIterator
        stream.Readable.from(biggest_file, { end: true }),
      )
        .on("end", () => {
          if (!fs.existsSync(filepath))
            fs.cp(biggest_file_path_converted, filepath, () => {});
        })
        .pipe();

      setResponseHeaders(event, {
        "Content-Type": `video/${biggest_file_type}`,
      });

      try {
        if (!fs.existsSync(biggest_file_path_converted))
          convert_stream.pipe(
            fs.createWriteStream(biggest_file_path_converted),
          );
      } catch {
        // if (fs.existsSync(biggest_file_path_converted))
        //   fs.rmSync(biggest_file_path_converted);
      }
      return convert_stream;
    } else {
      torrent.on("done", () => {
        if (!fs.existsSync(filepath))
          fs.cp(biggest_file_path, filepath, () => {});
      });

      // For direct streams, we can support range requests if the torrent client provides them
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : biggest_file.length - 1;

        setResponseHeaders(event, {
          "Content-Range": `bytes ${start}-${end}/${biggest_file.length}`,
          "Accept-Ranges": "bytes",
          "Content-Type": `video/${biggest_file_type}`,
        });
        setResponseStatus(event, 206);

        return biggest_file.createReadStream({ start, end });
      }

      setResponseHeaders(event, {
        "Content-Type": `video/${biggest_file_type}`,
      });
      // @ts-ignore: webtorrent file implement asyncIterator
      return stream.Readable.from(biggest_file);
    }
  },
);

function convert_to_webm(
  input: stream.Readable | string,
): ffmpeg.FfmpegCommand {
  let command = ffmpeg(input)
    // i originally tried mp4, but the output was stuttering even with -movflags frag_keyframe+empty_moov (because mp4 format need a seekable output, eg a file, not a stream/pipe)
    // sadly, webm convertion is VERY slow compared to mp4
    .audioBitrate(128)
    .audioCodec("libvorbis")
    .audioChannels(2)
    .videoBitrate(1024)
    .videoCodec("libvpx")
    .outputFormat("webm")
    .outputOptions([
      "-cpu-used 2",
      "-deadline realtime",
      "-preset ultrafast",
      "-error-resilient 1",
      `-threads ${Math.min(os.availableParallelism(), 16)}`,
    ]);

  command
    // .on("start", (cmdLine) => {
    //   console.log("Spawned FFmpeg with command: " + cmdLine);
    // })
    // .on("progress", (progress) => {
    //   if (!progress) return;
    //   process.stdout.write(
    //     `Processing: ${progress.percent?.toFixed(2)}% done\r`,
    //   );
    // })
    .on("error", (err, _stdout, stderr) => {
      // console.error("An error occurred: " + err.message);
      // console.error("FFmpeg stderr: " + stderr);
    })
    .on("end", () => {
      // process.stdout.write(`Processing: 100% done\r`);
      console.log("\nConversion finished successfully!");
    });
  return command;
}
