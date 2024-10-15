export default defineNuxtConfig({
  // 
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss", "@nuxt/icon", "@sidebase/nuxt-auth"],

  auth: {
    isEnabled: true,
    disableServerSideAuth: false,
    originEnvKey: 'AUTH_ORIGIN',
    baseURL: 'http://localhost:3000/api/auth',
    sessionRefresh: {
      enablePeriodically: true,
      enableOnWindowFocus: true,
    },
  },



  compatibilityDate: "2024-10-15",
});