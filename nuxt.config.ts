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
    tmdbApiKey: get_from_env("TMDB_API_KEY"),
    jackettApiKey: get_from_env("JACKETT_API_KEY"),
  },
  nitro: {
    experimental: {
      tasks: true,
      openAPI: true,
    },
    openAPI: {
      production: "prerender",
      ui: {
        scalar: {
          servers: [
            {
              url: "http://localhost:3000",
              description: "dev server server",
            },
            {
              url: "https://mirsella.mooo.com/hypertube",
              description: "Production server",
            },
          ],
        },
      },
    },
    scheduledTasks: {
      "0 * * * *": ["remove_old_movies"],
    },
    // fix file not copied https://github.com/nuxt/nuxt/issues/22325#issuecomment-1690421926
    externals: {
      traceInclude: [
        "./node_modules/node-datachannel/build/Release/node_datachannel.node",
      ],
    },
    hooks: {
      "dev:reload": () => {
        require("node-datachannel");
      },
    },
  },
});
