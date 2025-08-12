// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/ionic','@nuxtjs/tailwindcss'],
  css: ["@/theme/variables.css"],
  ssr:false,

   runtimeConfig: {
    
    public: {
      apiBase: process.env.SERVER_URL || 'http://localhost:3030',
    }
  },

})