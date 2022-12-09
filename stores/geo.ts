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
    provinsi: null as ValueGeo | null,
    kabupaten: null as ValueGeo | null,
    kecamatan: null as ValueGeo | null,
    kelurahan: null as ValueGeo | null,
    pelanggan: null as ValueGeo | null,
    type: null as 'provinsi' | 'kabupaten' | 'kecamatan' | 'kelurahan' | 'pelanggan' | null,
  }),
  actions: {
    async getGeo(data: {
      altitude: string
      listLatlon: string
    }) {
      const res = await $fetch('/api/geo', {
        method: 'post',
        body: data,
      })
      console.log(res)
    },
  },
})
