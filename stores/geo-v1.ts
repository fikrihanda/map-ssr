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

const config = useRuntimeConfig()

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
    removeGeo(datas: string[]) {
      datas.forEach((dt) => {
        this[`geo${useCapitalize(dt)}` as 'geoProvinsi' | 'geoKabupaten' | 'geoKecamatan' | 'geoKelurahan' | 'geoPelanggan'] = null
      })
    },
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
    async getGeoToGeo(data: { idWilayah: string }) {
      if (this.isHit)
        return
      this.isHit = true
      try {
        const res = await this.getGeoLocal(data)
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
    async getGeoLocal(data: { idWilayah: string }) {
      const res = await $fetch<{
        data: {
          Data1: string
          Data2: string
          Data3: string
        }
        success: boolean
        message: string
      }>('https://rcrmdev.iconpln.co.id/icrm-be-backoffice-dev/geo/latlon/lihat/V1', {
        method: 'POST',
        body: data,
        headers: {
          Authorization: `Bearer ${config.public.token}`,
        },
      })
      if (!res.success) {
        return Promise.reject(createError({
          message: res.message,
          statusMessage: res.message,
        }))
      }
      if (res.data.Data1 !== '') {
        return Promise.reject(createError({
          message: res.data.Data1,
          statusMessage: res.data.Data1,
        }))
      }
      const [layer, warna] = res.data.Data2.split('@@')
      const parse = parseData(res.data.Data3, [
        'id',
        'lat',
        'lng',
        'nama',
        'jumlah',
      ])

      return {
        layer,
        warna,
        lokasi: parse,
      }
    },
  },
})
