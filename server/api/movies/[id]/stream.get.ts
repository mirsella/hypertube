import ffmpeg from "fluent-ffmpeg";
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
  ): Promise<stream.Readable | stream.Writable | stream.PassThrough> => {
    const session = await getServerSession(event);
    if (!session) throw createError({ statusCode: 401 });

    const moviesDir = useRuntimeConfig(event).moviesDir;
    if (!fs.existsSync(moviesDir)) fs.mkdirSync(moviesDir);
    const id = getRouterParam(event, "id");
    if (!id)
      throw createError({ statusCode: 400, statusMessage: "no id given" }); // should be useless as this route should only be hit when there is a id
    const filepath = path.join(moviesDir, id);

    const file_stream = await new Promise<fs.ReadStream | null>((resolve) => {
      const stream = fs.createReadStream(filepath);
      stream.on("error", (err: NodeJS.ErrnoException) => {
        if (err.code !== "ENOENT") console.error(`reading ${filepath}: ${err}`);
        resolve(null);
      });
      stream.on("open", () => resolve(stream));
    });
    if (file_stream) return file_stream;

    const infos = await $fetch(`/api/movies/${id}`);
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
    // @ts-ignore: webtorrent file implement asyncIterator
    const biggest_file_stream = stream.Readable.from(biggest_file, {
      end: true,
    });
    const biggest_file_path = torrent.path + "/" + biggest_file.path;
    const biggest_file_path_converted = biggest_file_path + ".converted";

    if (
      !biggest_file.name.endsWith(".mp4") &&
      !biggest_file.name.endsWith(".webm")
    ) {
      console.log("converting", biggest_file.name, "to webm");
      let stream = convert_to_webm(biggest_file_stream)
        .on("end", () => {
          if (!fs.existsSync(filepath))
            fs.cp(biggest_file_path_converted, filepath, () => {});
        })
        .pipe();
      if (!fs.existsSync(biggest_file_path_converted))
        stream.pipe(fs.createWriteStream(biggest_file_path_converted));
      return stream;
    } else {
      torrent.on("done", () => {
        if (!fs.existsSync(filepath))
          fs.cp(biggest_file_path, filepath, () => {});
      });
      return biggest_file_stream;
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
      console.error("An error occurred: " + err.message);
      console.error("FFmpeg stderr: " + stderr);
    })
    .on("end", () => {
      // process.stdout.write(`Processing: 100% done\r`);
      console.log("\nConversion finished successfully!");
    });
  return command;
}
