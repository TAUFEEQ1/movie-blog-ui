// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  
  modules: [
    '@nuxt/ui',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxtjs/strapi',
    '@pinia/nuxt'
  ],

  strapi: {
    url: process.env.STRAPI_URL || 'http://localhost:1337',
    prefix: '/api',
    version: 'v4',
    cookie: {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  },

  runtimeConfig: {
    public: {
      strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337'
    }
  },

  css: ['~/assets/css/main.css']
})
