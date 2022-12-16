// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['vuetify/styles', '@mdi/font/css/materialdesignicons.css'],
  ssr: false,
  modules: [
    '@vueuse/nuxt',
    [
      '@pinia/nuxt',
      {
        autoImports: ['defineStore'],
      },
    ],
    'nuxt-lodash',
    'nuxt-svgo',
    '~/modules/vuetify',
  ],
  runtimeConfig: {
    token: process.env.TOKEN,
    public: {
      mapKey: process.env.MAP_KEY,
    },
  },
  imports: {
    dirs: ['stores'],
  },
})
