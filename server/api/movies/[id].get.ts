import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";
import stream, { PassThrough } from "stream"
import fs, { constants } from "fs";
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
  const biggest_files = torrent.files.sort((a, b) => b.length - a.length);
  biggest_files.forEach((t, i) => {
    if (i !== 0) t.deselect()
  })
  const biggest_file = biggest_files[0]
  biggest_file.select()
  console.log(`torrent biggest file for ${title} is ${biggest_file.name}`)


  // FIXME: thoses hang, which is probably a bug somewhere in wettorrent on node
  // const biggest_file_stream = new stream.Readable().wrap(biggest_file.createReadStream());
  const biggest_file_stream = biggest_file.createReadStream() as stream.Readable;

  // TODO: download subtitles from opensubtitles
  // https://github.com/vankasteelj/opensubtitles.com

  const original_path = torrent.path + "/" + biggest_file.path;
  console.log("reading", original_path)
  const converted_path = original_path + ".mp4"
  // invalid input
  // const command = ConvertFfmpeg(biggest_file_stream, [])
  // produce bugged video
  // const command = ConvertFfmpeg(original_path, [])
  console.log("saving to", converted_path)
  const output = fs.createWriteStream(converted_path)
  command.pipe(output)

  setResponseHeader(event, "Content-Type", "video/mp4");
  while (true) {
    try {
      fs.accessSync(converted_path, fs.constants.F_OK)
      break;
    } catch {
      await new Promise<void>(resolve => setTimeout(() => resolve(), 100))
    }
  }
  await new Promise<void>(resolve => setTimeout(() => resolve(), 1000))
  return fs.createReadStream(converted_path)
});


function ConvertFfmpeg(input: stream.Readable | string, subtitles: {file: string, lang: string}[]): FfmpegCommand {
  let command = ffmpeg(input)
  .outputOptions([
    "-c:v libx264", // Video codec
    "-c:a aac", // Audio codec
    "-map 0:v", // Map video stream
    "-map 0:a", // Map audio stream
    "-preset veryfast", // Adjust encoding speed and quality
    // "-movflags frag_keyframe+empty_moov+default_base_moof", // Fragmented MP4 flags
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
      process.stdout.write(`Processing: 100% done\r`);
      console.log("\nConversion finished successfully!");
    });
  return command
}
