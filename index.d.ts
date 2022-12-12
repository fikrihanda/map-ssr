declare module '@nuxt/schema' {
  interface RuntimeConfig {
    token: string
    public: {
      mapKey: string
    }
  }
}

export {}