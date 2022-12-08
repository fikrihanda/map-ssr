// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['vuetify/styles', '@mdi/font/css/materialdesignicons.css'],
  ssr: false,
  modules: [
    '@vueuse/nuxt',
    'nuxt-lodash',
    '~/modules/vuetify',
  ],
})
