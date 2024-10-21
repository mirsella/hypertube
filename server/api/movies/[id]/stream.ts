import ffmpeg from "fluent-ffmpeg";
import os from "os";
import stream from "stream";
import fs from "fs";
import path from "path";

export default defineEventHandler(async (event) => {
  const moviesDir = useRuntimeConfig().moviesDir;
  // path.basename to sanitize the input (path traversal attack)
  const base64 = path.basename(getRouterParam(event, "id") || "");
  if (!base64) throw createError({ statusCode: 400 });
  const filepath = path.join(moviesDir, base64);

  const file_stream = await new Promise<fs.ReadStream | null>((resolve) => {
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
  // const magnet = // deadpool, mkv 1.3gb
  //   "magnet:?xt=urn:btih:87A2D22EB879593B48B3D3EE6828F56E2BFB4415&dn=Deadpool.and.Wolverine.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Fexplodie.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu%3A80%2Fannounce&tr=udp%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.birkenwald.de%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.moeking.me%3A6969%2Fannounce&tr=udp%3A%2F%2Fopentor.org%3A2710%2Fannounce&tr=udp%3A%2F%2Ftracker.dler.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fuploads.gamecoast.net%3A6969%2Fannounce&tr=https%3A%2F%2Ftracker.foreverpirates.co%3A443%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fcoppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.zer0day.to%3A1337%2Fannounce";
  const magnet = // rick and morty, mkv 156mb
    "magnet:?xt=urn:btih:c4abdb6d30b1cdae74e1237868dc64d47dfcd714&dn=Rick.and.Morty.S04E04.Claw.and.Hoarder.Special.Ricktims.Morty.HDTV.x264-CRiMSON%5BTGx%5D&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969&tr=udp%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2Fexplodie.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Fopen.demonii.si%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&tr=udp%3A%2F%2Fopentracker.i2p.rocks%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Fcoppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.zer0day.to%3A1337%2Fannounce";
  // const magnet = // singel, mp4, 133mb
  //   "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F";

  let torrent = torrent_client.torrents.find(
    (t) => t.magnetURI.toLowerCase() === magnet.toLowerCase(),
  );
  if (!torrent) {
    console.log("starting torrent for", title);
    torrent = torrent_client.add(magnet);
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
  console.log(`torrent biggest file for ${title} is ${biggest_file.name}`);
  // @ts-ignore: webtorrent file implement asyncIterator
  const biggest_file_stream = stream.Readable.from(biggest_file, { end: true });

  const pass = new stream.PassThrough();
  if (
    !biggest_file.name.endsWith(".mp4") &&
    !biggest_file.name.endsWith(".webm")
  ) {
    ConvertFfmpeg(biggest_file_stream).pipe(pass);
  } else {
    biggest_file_stream.pipe(pass);
  }
  pass.pipe(fs.createWriteStream(filepath));
  return sendStream(event, pass);
});

function ConvertFfmpeg(input: stream.Readable | string): ffmpeg.FfmpegCommand {
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
    .on("start", (cmdLine) => {
      console.log("Spawned FFmpeg with command: " + cmdLine);
    })
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
      process.stdout.write(`Processing: 100% done\r`);
      console.log("\nConversion finished successfully!");
    });
  return command;
}
