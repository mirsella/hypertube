export default defineNuxtConfig({
	devtools: { enabled: true },

	modules: ["@nuxtjs/tailwindcss", "@nuxt/icon", "@sidebase/nuxt-auth", "@nuxtjs/i18n"],

	auth: {
		isEnabled: true,
		disableServerSideAuth: false, // false, because we want to use server side auth

		originEnvKey: "AUTH_ORIGIN",
		baseURL: "http://localhost:3000/api/auth",
		sessionRefresh: {
			enablePeriodically: true,
			enableOnWindowFocus: true,
		},
	},

	i18n: {
		strategy: 'prefix_except_default',
		langDir: 'locales/',
		defaultLocale: 'en',
		locales: [
		  { code: 'en', name: 'English', language: 'en-US', file: 'en.json' },
		  { code: 'fr', name: 'Français', language: 'fr-FR', file: 'fr.json' }
		],
	  }, 
	

	  compatibilityDate: "2024-10-15",
});
