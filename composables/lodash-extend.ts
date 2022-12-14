export const useBetween = function (val: number, a: number, b: number, inclusive = true) {
  const min = Math.min(a, b)
  const max = Math.max(a, b)
  return inclusive ? val >= min && val <= max : val > min && val < max
}
