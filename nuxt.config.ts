function get_from_env(field: string): string {
  const env = process.env[field];
  if (!env && process.env.NODE_ENV === "development") {
    console.error(field, "ENV VARIABLE ISN'T SET !!!");
    process.exit(1);
  }
  return env || "";
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  runtimeConfig: {
    moviesDir: "./downloaded",
    opensubtitles_key: get_from_env("OPENSUBTITLES_KEY"),
    opensubtitles_username: get_from_env("OPENSUBTITLES_USERNAME"),
    opensubtitles_password: get_from_env("OPENSUBTITLES_PASSWORD"),
    pgpassword: get_from_env("PGPASSWORD"),
  },
  nitro: {
    // we need https://github.com/unjs/nitro/pull/2570
    experimental: { tasks: true, openAPI: true },
    scheduledTasks: {
      "0 * * * *": ["remove_old_movies"],
    },
    hooks: {
      // fix "Module did not self-register" error. see https://github.com/lovell/sharp/issues/3295
      "dev:reload": () => require("node-datachannel"),
    },
  },
});
