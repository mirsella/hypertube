import fs from "fs";

function get_from_env(field: string): string {
  const env = process.env[field];
  if (!env) {
    console.error(field, "ENV VARIABLE ISN'T SET !!!");
  }
  return env || "";
}

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/icon",
    "@sidebase/nuxt-auth",
    "@nuxtjs/i18n",
  ],
  plugins: ["~/plugins/eventBus.ts"],
  runtimeConfig: {
    debug: true,
    moviesDir: "./downloaded",
    opensubtitles_key: get_from_env("OPENSUBTITLES_KEY"),
    opensubtitles_username: get_from_env("OPENSUBTITLES_USERNAME"),
    opensubtitles_password: get_from_env("OPENSUBTITLES_PASSWORD"),
    tmdbApiKey: get_from_env("TMDB_API_KEY"),
    jackettApiKey: get_from_env("JACKETT_API_KEY"),
    jackettUrl: process.env.JACKETT_URL || "localhost",
  },
  auth: {
    isEnabled: true,
    disableServerSideAuth: false,
    originEnvKey: "AUTH_ORIGIN",
    baseURL: "http://localhost:3000/api/auth",
    sessionRefresh: {
      enablePeriodically: true,
      enableOnWindowFocus: true,
    },
  },
  i18n: {
    strategy: "no_prefix",
    langDir: "locales/",
    defaultLocale: "en",
    detectBrowserLanguage: false,
    locales: [
      { code: "fr", name: "Français", language: "fr-FR", file: "fr.json" },
      { code: "en", name: "English", language: "en-US", file: "en.json" }
    ],
  },
  hooks: {
    "nitro:build:public-assets": () => {
      fs.cpSync(
        "node_modules/node-datachannel/build",
        ".output/server/node_modules/node-datachannel/build",
        { recursive: true },
      );
    },
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
              description: "dev server",
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
    hooks: {
      "dev:reload": () => {
        require("node-datachannel");
      },
    },
  },
});
