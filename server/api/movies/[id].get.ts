import ffmpeg from "fluent-ffmpeg";
import stream, { PassThrough } from 'stream'
import fs, { writevSync } from "fs";
import path from "path";
import { torrent_client } from "~/server/utils/webtorrent";

export default defineEventHandler(async (event) => {
  const moviesDir = useRuntimeConfig().moviesDir;
  // path.basename to sanitize the input (path traversal attack)
  const base64 = path.basename(getRouterParam(event, "id") || "");
  if (!base64) throw createError({ statusCode: 400 });
  const filepath = path.join(moviesDir, base64 + ".mp4");

  const file_stream = await new Promise<fs.ReadStream | null>(resolve => {
    const stream = fs.createReadStream(filepath);
    stream.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code !== "ENOENT") console.error(`reading ${filepath}: ${err}`);
      resolve(null);
    });
    stream.on("open", () => resolve(stream));
  });
  if (file_stream) return sendStream(event, file_stream);

  const title = Buffer.from(base64, "base64").toString();
  // TODO: get the magnet/torrent from jackett api instead, this is just for testing
  const magnet =
    "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F";

  let torrent = torrent_client.torrents.find(t => t.magnetURI===magnet)
  if (!torrent) {
    console.log("starting torrent for", title);
    torrent = torrent_client.add(magnet);
  }
  if (!torrent.ready) {
    await new Promise<void>(resolve => {
      torrent.on("ready", () => resolve());
    })
  }
  const biggest_file = torrent.files.sort((a, b) => b.length - a.length)[0];
  console.log(`torrent biggest file for ${title} is ${biggest_file.name}`)
  // const torrent_file_stream = new stream.Readable().wrap(biggest_file.createReadStream());
  // FIXME: this is hang.
  const torrent_file_stream = biggest_file.createReadStream() as stream.Readable;
  // const torrent_file_stream = stream.Readable.from(biggest_file)

  // TODO: download subtitles from opensubtitles
  // https://github.com/vankasteelj/opensubtitles.com

  console.log("converting to mp4 with subtitles for", title)
  const command = ConvertFfmpeg(torrent_file_stream, [])
  const converted_path = biggest_file.name + ".mp4"
  console.log("saving to", converted_path)
  command.save(converted_path)

  setResponseHeader(event, "Content-Type", "video/mp4");
  setResponseHeader(event, "Transfer-Encoding", "chunked");
  return sendStream(event, fs.createReadStream(converted_path));
});


function ConvertFfmpeg(input: stream.Readable , subtitles: {file: string, lang: string}[]):ffmpeg.FfmpegCommand {
  let command = ffmpeg(input)
  .outputOptions([
    "-c:v libx264", // Video codec
    "-c:a aac", // Audio codec
    "-map 0:v", // Map video stream
    "-map 0:a", // Map audio stream
    "-preset veryfast", // Adjust encoding speed and quality
    "-movflags frag_keyframe+empty_moov+default_base_moof", // Fragmented MP4 flags
  ])
  .format("mp4");

  subtitles.forEach((subtitle, index) => {
    command = command.input(subtitle.file);
    // Set subtitle codec and language metadata
    command = command.outputOptions([
      `-c:s:${index} mov_text`,
      `-metadata:s:s:${index} language=${subtitle.lang}`,
      // Map the subtitle stream from the corresponding input
      `-map ${index + 1}:s:0`,
    ]);
  });

  command
    .on("start", (cmdLine) => {
      console.log("Spawned FFmpeg with command: " + cmdLine);
    })
    .on("progress", (progress) => {
      process.stdout.write(`Processing: ${progress.percent?.toFixed(2)}% done\r`);
    })
    .on("error", (err, stdout, stderr) => {
      console.error("An error occurred: " + err.message);
      console.error("FFmpeg stderr: " + stderr);
    })
    .on("end", () => {
      console.log("\nConversion finished successfully!");
    });
  console.log("sleeping 5sec")
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000*1000*5);
  console.log("slept, returning")
  return command.pipe(new stream.Writable, {end:true})
}
