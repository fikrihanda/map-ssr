import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((nuxt) => {
  const vuetify = createVuetify({ ssr: false })
  nuxt.vueApp.use(vuetify)
})
