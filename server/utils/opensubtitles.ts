// @ts-ignore: no types for this package
import opensubtitles from "opensubtitles.com";
const config = useRuntimeConfig();

console.log("opensubtitles_key:", config.opensubtitles_key);

export const opensubtitles_client = new opensubtitles({
  apikey: config.opensubtitles_key,
});
export default opensubtitles_client;

opensubtitles_client.login({
  username: config.opensubtitles_username,
  password: config.opensubtitles_password,
});
