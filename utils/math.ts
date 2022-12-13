export const toRadians = function (degrees: number) {
  const pi = Math.PI
  return degrees * (pi / 180)
}

export const numberUnit = function (num: number | string, round = 1) {
  const numb = Number(num)
  // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
  const unit = Math.floor(Math.round(numb / 1.0e+1).toString().replaceAll(',', '').length)
  const wunit = [
    'K',
    'JT',
    'M',
    'B',
  ][Math.floor(unit / 3) - 1]
  const funit = Math.abs(numb) / Number(`1.0e+${unit - unit % 3}`)
  return wunit ? `${funit.toFixed(round).toLocaleString()} ${wunit}` : numb.toFixed(round).toString()
}
