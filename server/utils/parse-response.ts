export const parseData = function<R = any> (stringBody: string, keys: (keyof R)[]) {
  return stringBody.split('@@').reduce((prev, current) => {
    const curSplit = current.split('##')
    const re = {} as R
    for (const [i, cur] of curSplit.entries()) {
      const key = keys[i]
      if (key === 'lat' || key === 'lng')
        re[key] = parseFloat(cur) as any
      else
        re[key] = cur as any
    }
    prev.push(re)
    return prev
  }, [] as R[])
}
