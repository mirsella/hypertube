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
  const filepath = path.join(moviesDir, base64);

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
    "magnet:?xt=urn:btih:87A2D22EB879593B48B3D3EE6828F56E2BFB4415&dn=Deadpool.and.Wolverine.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Fexplodie.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu%3A80%2Fannounce&tr=udp%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.birkenwald.de%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.moeking.me%3A6969%2Fannounce&tr=udp%3A%2F%2Fopentor.org%3A2710%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fuploads.gamecoast.net%3A6969%2Fannounce&tr=https%3A%2F%2Ftracker.foreverpirates.co%3A443%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fcoppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.zer0day.to%3A1337%2Fannounce";

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
  // @ts-ignore: webtorrent file implement asyncIterator
  const biggest_file_stream = stream.Readable.from(biggest_file)

  // TODO: download subtitles from opensubtitles
  // https://github.com/vankasteelj/opensubtitles.com

  const pass = new stream.PassThrough()
  if (!biggest_file.name.endsWith(".mp4") && !biggest_file.name.endsWith(".webm")){
    ConvertFfmpeg(biggest_file_stream, []).pipe(pass)
  }   else {
    biggest_file_stream.pipe(pass)
  }

  pass.pipe(fs.createWriteStream(filepath))

  return sendStream(event,pass)
});


function ConvertFfmpeg(input: stream.Readable | string, subtitles: {file: string, lang: string}[]): FfmpegCommand {
  let command = ffmpeg(input)
  .outputOptions([
    "-c:v libx264", // Video codec
    "-c:a aac", // Audio codec
    "-map 0:v", // Map video stream
    "-map 0:a", // Map audio stream
    "-preset ultrafast", // Adjust encoding speed and quality
    "-movflags frag_keyframe+empty_moov+default_base_moof", // Fragmented MP4 flags
  ]).outputFormat("mp4")

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
    .on("start", cmdLine => {
      console.log("Spawned FFmpeg with command: " + cmdLine);
    })
    .on("progress", progress => {
      if (!progress) return
      process.stdout.write(`Processing: ${progress.percent?.toFixed(2)}% done\r`);
    })
    .on("error", (err, _stdout, stderr) => {
      console.error("An error occurred: " + err.message);
      console.error("FFmpeg stderr: " + stderr);
    })
    .on("end", () => {
      process.stdout.write(`Processing: 100% done\r`);
      console.log("\nConversion finished successfully!");
    });
  return command
}
