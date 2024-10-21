function get_from_env(field: string): string {
  return process.env[field] || process.exit(1);
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
    experimental: { tasks: true },
    scheduledTasks: {
      "0 * * * *": ["remove_old_movies"],
    },
  },
});
