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

export const getBoundsZoomLevel = function (bounds: google.maps.LatLngBounds, mapDim: { height: number; width: number }) {
  const WORLD_DIM = { height: 256, width: 256 }
  const ZOOM_MAX = 21

  function latRad(lat: number) {
    const sin = Math.sin(lat * Math.PI / 180)
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2
  }

  function zoom(mapPx: number, worldPx: number, fraction: number) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2)
  }

  const ne = bounds.getNorthEast()
  const sw = bounds.getSouthWest()

  const latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI

  const lngDiff = ne.lng() - sw.lng()
  const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360

  const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction)
  const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction)

  return Math.min(latZoom, lngZoom, ZOOM_MAX)
}
