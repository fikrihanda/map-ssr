import type { MaybeRef } from '@vueuse/shared'
import { get as getRef } from '@vueuse/core'

export const mapStyles = [
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'transit',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
]

export const altitudeMap = function (zoom: MaybeRef<number>) {
  const getZoom = getRef(zoom)
  const partEq = (0.05 * (591657550.5 / 2.0 ** (getZoom - 1) / 2))
  const altitudeMap = partEq * (Math.cos(toRadians(85.362 / 2)) / Math.sin(toRadians(85.362 / 2)))
  return altitudeMap
}
