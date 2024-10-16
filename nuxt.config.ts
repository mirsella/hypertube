// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  runtimeConfig: {
    moviesDir: "./movies",
  },
  nitro: {
    experimental: { tasks: true },
    scheduledTasks: {
      "0 * * * *": ["remove_old_movies"],
    },
  },
});
