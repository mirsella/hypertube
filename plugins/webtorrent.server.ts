import WebTorrent from "webtorrent";

export default defineNuxtPlugin((app) => {
  return {
    provide: {
      torrent_client: new WebTorrent(),
    },
  };
});
