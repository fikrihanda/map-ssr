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
    '~/modules/vuetify',
  ],
  runtimeConfig: {
    token: process.env.TOKEN,
  },
  imports: {
    dirs: ['stores'],
  },
})
