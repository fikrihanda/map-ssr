export interface ValueGeo {
  warna: string
  lokasi: {
    lat: number
    lng: number
    nama: string
    jumlah: string | number
  }[]
}

export const useGeoLoc = defineStore('GeoLoc', {
  state: () => ({
    isHit: false,
    provinsi: null as ValueGeo | null,
    kabupaten: null as ValueGeo | null,
    kecamatan: null as ValueGeo | null,
    kelurahan: null as ValueGeo | null,
    pelanggan: null as ValueGeo | null,
    type: null as 'provinsi' | 'kabupaten' | 'kecamatan' | 'kelurahan' | 'pelanggan' | null,
  }),
  getters: {
    getPelanggan: state => state.pelanggan,
    getType: state => state.type,
  },
  actions: {
    async getGeo(data: {
      altitude: string | number
      list: string
      baru: string
    }) {
      if (this.isHit)
        return
      this.isHit = true
      const prevType = this.type
      try {
        const res = await $fetch('/api/geo', {
          method: 'post',
          body: data,
        })
        if (res.layer === '1')
          this.type = 'pelanggan'
        if (res.layer === '2')
          this.type = 'kelurahan'
        if (res.layer === '3')
          this.type = 'kecamatan'
        if (res.layer === '4')
          this.type = 'kabupaten'
        if (res.layer === '5')
          this.type = 'provinsi'
        this.pelanggan = useOmit(res, ['layer'])
        this.isHit = false
        return { prevType }
      }
      catch (err) {
        this.isHit = false
        return Promise.reject(err)
      }
    },
  },
})
