// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/ionic', '@nuxtjs/tailwindcss'],
  css: ["@/theme/variables.css"],
  ssr: false,

  runtimeConfig: {

    public: {
      apiBase: process.env.SERVER_URL || 'http://localhost:3030',
    }
  },
/*
  i18n: {
    defaultLocale: 'fr',
    strategy: 'no_prefix',
    locales: [
      { code: 'ar-AR', file: 'ar.json' },
      { code: 'fr-FR',  file: 'fr.json' }
    ],
     detectBrowserLanguage: false,
    skipSettingLocaleOnNavigate: true,
    experimental: {
      preload: false,
      stripMessagesPayload: false
    }
  
  }
*/
})  