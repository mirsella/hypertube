import Webtorrent from "webtorrent";
import fs from "fs";

export const torrent_client = new Webtorrent();
export default torrent_client;

fs.mkdir(useRuntimeConfig().moviesDir, { recursive: true }, () => {});
