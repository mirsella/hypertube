// @ts-ignore: no types for this package
import opensubtitles from "opensubtitles.com";

export default defineNuxtPlugin((app) => {
  const config = useRuntimeConfig();
  const opensubtitles_client = new opensubtitles({
    apikey: config.opensubtitles_key,
  });

  opensubtitles_client.login({
    username: config.opensubtitles_username,
    password: config.opensubtitles_password,
  });

  return {
    provide: {
      opensubtitles_client,
    },
  };
});
