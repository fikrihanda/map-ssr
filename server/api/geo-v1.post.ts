import { parseData } from '~~/server/utils/parse-response'

export default defineEventHandler(async (event) => {
  const { token } = useRuntimeConfig()
  const body = await readBody<{
    idWilayah: string
  }>(event)

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
    body,
    headers: {
      Authorization: `Bearer ${token}`,
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
})
