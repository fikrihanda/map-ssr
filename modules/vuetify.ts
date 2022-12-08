import { defineNuxtModule } from '@nuxt/kit'
import vuetify from 'vite-plugin-vuetify'

export default defineNuxtModule({
  setup(_opts, nuxt) {
    nuxt.hook('vite:extendConfig', (config) => {
      config.plugins?.push(vuetify({ autoImport: false }))
    })
  },
})
