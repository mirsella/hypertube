import ffmpeg from "fluent-ffmpeg";
import os from "os";
import stream, { PassThrough } from "stream";
import fs from "fs";
import path from "path";
import WebTorrent from "webtorrent";

export default defineEventHandler(async (event) => {
  // TODO: check auth
  const moviesDir = useRuntimeConfig().moviesDir;
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "no id" }); // should be useless as this route should only be hit when there is a id
  const filepath = path.join(moviesDir, id);

  const file_stream = await new Promise<fs.ReadStream | null>((resolve) => {
    const stream = fs.createReadStream(filepath);
    stream.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code !== "ENOENT") console.error(`reading ${filepath}: ${err}`);
      resolve(null);
    });
    stream.on("open", () => resolve(stream));
  });
  if (file_stream) return sendStream(event, file_stream);

  const torrent_client = new WebTorrent();

  const infos = await $fetch(`/api/movies/${id}`);

  let torrent = torrent_client.torrents.find(
    (t) => t.magnetURI.toLowerCase() === infos.torrents[0].magnet.toLowerCase(),
  );
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
  console.log(
    `torrent biggest file for ${infos.title} is ${biggest_file.name}`,
  );
  // @ts-ignore: webtorrent file implement asyncIterator
  const biggest_file_stream = stream.Readable.from(biggest_file, { end: true });
  const biggest_file_path = torrent.path + "/" + biggest_file.path;

  const pass = new stream.PassThrough();
  const copy_if_nonexistant = () => {
    try {
      fs.accessSync(filepath, fs.constants.R_OK);
    } catch {
      fs.cpSync(biggest_file_path + ".converted", filepath);
    }
  };
  if (
    !biggest_file.name.endsWith(".mp4") &&
    !biggest_file.name.endsWith(".webm")
  ) {
    console.log("converting", biggest_file_path, "to webm");
    convert_to_webm(biggest_file_stream)
      .on("end", copy_if_nonexistant)
      .pipe(pass);
  } else {
    biggest_file_stream.pipe(pass);
    torrent.on("done", copy_if_nonexistant);
  }
  pass.pipe(fs.createWriteStream(biggest_file_path + ".converted"));
  const res = new PassThrough();
  pass.pipe(res);
  return sendStream(event, res);
});

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
