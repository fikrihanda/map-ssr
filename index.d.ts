declare module '@nuxt/schema' {
  interface RuntimeConfig {
    apiSecret: string
    token: string
    public: {
      apiBase: string
      mapKey: string
    }
  }
}

export {}