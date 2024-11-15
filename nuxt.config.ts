import fs from "fs";

function get_from_env(field: string): string {
    const env = process.env[field];
    if (!env && process.env.NODE_ENV === "development") {
        console.error(field, "ENV VARIABLE ISN'T SET !!!");
        process.exit(1);
    }
    return env || "";
}

export default defineNuxtConfig({
    devtools: { enabled: true },

    modules: ["@nuxtjs/tailwindcss", "@nuxt/icon", "@sidebase/nuxt-auth", "@nuxtjs/i18n"],
    plugins: ["~/plugins/eventBus.ts"],

    runtimeConfig: {
        moviesDir: "./downloaded",
        opensubtitles_key: get_from_env("OPENSUBTITLES_KEY"),
        opensubtitles_username: get_from_env("OPENSUBTITLES_USERNAME"),
        opensubtitles_password: get_from_env("OPENSUBTITLES_PASSWORD"),
        pgpassword: get_from_env("PGPASSWORD"),
        tmdbApiKey: get_from_env("TMDB_API_KEY"),
    },
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
        strategy: "prefix_except_default",
        langDir: "locales/", // Utilisation d'un chemin absolu dans Docker
        defaultLocale: "en",
        locales: [
            { code: "en", name: "English", language: "en-US", file: "en.json" },
            { code: "fr", name: "Français", language: "fr-FR", file: "fr.json" },
        ],
    },

    nitro: {
        // we need https://github.com/unjs/nitro/pull/2570
        experimental: { tasks: true, openAPI: true },
        scheduledTasks: {
            "0 * * * *": ["remove_old_movies"],
        },
        // fix file not copied https://github.com/nuxt/nuxt/issues/22325#issuecomment-1690421926
    },
    compatibilityDate: "2024-10-15",
});