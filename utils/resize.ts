const breakpoint = {
  pelanggan: [8, 1000],
  kelurahan: [1001, 4000],
  kecamatan: [4001, 32000],
  kabupaten: [32001, 501250],
  provinsi: [501251, 1002500],
} as const

const minPxl = 15
const maxPxl = 25

// ceiling((7000 * 100 /  cast((8000/8) as float)) / 8)

const calcuPercentage = function (min: number, max: number, position: number) {
  return ((position - min) * 100) / (max - min)
}
const calcuValue = function (min: number, max: number, percentage: number) {
  return (percentage * (max - min) / 100) + min
}

export const changeResizeIcon = function (alt: number | null, mode: keyof (typeof breakpoint) | null) {
  if (!alt || !mode)
    return
  const gerBreak = breakpoint[mode]
  const [min, max] = gerBreak

  let al = alt

  if (alt <= min)
    al = min
  if (alt >= max)
    al = max

  const percen = calcuPercentage(gerBreak[0], gerBreak[1], al)

  const val = calcuValue(minPxl, maxPxl, 100 - percen)

  return val
}

export const changeOpacitySize = function (alt: number | null, mode: keyof (typeof breakpoint) | null, size = 7) {
  if (!alt || !mode)
    return
  const gerBreak = breakpoint[mode]
  const [min, max] = gerBreak

  let al = alt

  if (alt <= min)
    al = min
  if (alt >= max)
    al = max

  const percen = calcuPercentage(gerBreak[0], gerBreak[1], al)

  const val = calcuValue(minPxl + size, maxPxl + size, 100 - percen)

  return val
}
