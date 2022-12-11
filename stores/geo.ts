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
    getProvinsi: state => state.provinsi,
    getKabupaten: state => state.kabupaten,
    getKecamatan: state => state.kecamatan,
    getKelurahan: state => state.kelurahan,
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
        if (res.layer === '1') {
          this.type = 'pelanggan'
          this.pelanggan = useOmit(res, ['layer'])
        }
        if (res.layer === '2') {
          this.type = 'kelurahan'
          this.kelurahan = useOmit(res, ['layer'])
        }
        if (res.layer === '3') {
          this.type = 'kecamatan'
          this.kecamatan = useOmit(res, ['layer'])
        }
        if (res.layer === '4') {
          this.type = 'kabupaten'
          this.kabupaten = useOmit(res, ['layer'])
        }
        if (res.layer === '5') {
          this.type = 'provinsi'
          this.provinsi = useOmit(res, ['layer'])
        }
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
