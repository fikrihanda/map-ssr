export interface ValueGeo {
  warna: string
  lokasi: {
    id: string
    lat: number
    lng: number
    nama: string
    jumlah: string | number
  }[]
}

export interface SelectedGeo {
  id: string
  type: 'provinsi' | 'kabupaten' | 'kecamatan' | 'kelurahan'
}

export const useGeoLocV1 = defineStore('GeoLocV1', {
  state: () => ({
    isHit: false,
    geoProvinsi: null as ValueGeo | null,
    geoKabupaten: null as ValueGeo | null,
    geoKecamatan: null as ValueGeo | null,
    geoKelurahan: null as ValueGeo | null,
    geoPelanggan: null as ValueGeo | null,
    selecteds: [] as SelectedGeo[],
  }),
  getters: {
    getGeoPronvisi: state => state.geoProvinsi,
    getGeoKabupaten: state => state.geoKabupaten,
    getGeoKecamatan: state => state.geoKecamatan,
    getGeoKelurahan: state => state.geoKelurahan,
    getGeoPelanggan: state => state.geoPelanggan,
    getAllSelecteds: state => state.selecteds,
    findSelecteds: (state) => {
      return (type: SelectedGeo['type']) => {
        return state.selecteds.find((sel) => {
          return sel.type === type
        })
      }
    },
  },
  actions: {
    async getGeo(data: { idWilayah: string }) {
      if (this.isHit)
        return
      this.isHit = true
      try {
        const res = await $fetch('/api/geo-v1', {
          method: 'post',
          body: data,
        })
        if (res.layer === '5')
          this.geoProvinsi = res

        if (res.layer === '4') {
          const isOn = this.findSelecteds('provinsi')
          if (!isOn) {
            this.selecteds.push({
              id: data.idWilayah,
              type: 'provinsi',
            })
          }
          this.geoKabupaten = res
        }
        if (res.layer === '3') {
          const isOn = this.findSelecteds('kabupaten')
          if (!isOn) {
            this.selecteds.push({
              id: data.idWilayah,
              type: 'kabupaten',
            })
          }
          this.geoKecamatan = res
        }

        if (res.layer === '2') {
          const isOn = this.findSelecteds('kecamatan')
          if (!isOn) {
            this.selecteds.push({
              id: data.idWilayah,
              type: 'kecamatan',
            })
          }
          this.geoKelurahan = res
        }

        if (res.layer === '1') {
          const isOn = this.findSelecteds('kelurahan')
          if (!isOn) {
            this.selecteds.push({
              id: data.idWilayah,
              type: 'kelurahan',
            })
          }
          this.geoPelanggan = res
        }
        this.isHit = false
        return {}
      }
      catch (err) {
        this.isHit = false
        return Promise.reject(err)
      }
    },
  },
})
