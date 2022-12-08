<script lang="ts" setup>
import { VApp, VMain, VSheet } from 'vuetify/components'
import { GoogleMap } from 'vue3-google-map'

useHead({
  title: 'Map',
})

const map = ref<InstanceType<typeof GoogleMap> | null>(null)
const mapZoom = ref<number | null>(null)
const mapBounds = ref<{
  north_east: [number, number]
  south_west: [number, number]
  north_west: [number, number]
  south_east: [number, number]
} | null>(null)

const mapReady = computed(() => {
  if (!map.value)
    return false
  return map.value.ready
})
const mapAlt = computed(() => {
  if (!map.value)
    return null
  if (!mapZoom.value)
    return null
  const partEq = (0.05 * (591657550.5 / 2.0 ** (mapZoom.value - 1) / 2))
  const altitudeMap = partEq * (Math.cos(toRadians(85.362 / 2)) / Math.sin(toRadians(85.362 / 2)))
  return altitudeMap
})

const zoomChanged = function () {
  mapZoom.value = map.value?.map?.getZoom() ?? null
}
const boundsChanged = function () {
  if (!map.value)
    return
  if (!map.value.map)
    return
  const getBounds = map.value.map.getBounds() ?? null
  if (!getBounds)
    return
  const center = map.value.map.getCenter()
  if (!center)
    return
  const east = getBounds.getNorthEast().lng()
  const north = getBounds.getNorthEast().lat()
  const west = getBounds.getSouthWest().lng()
  const south = getBounds.getSouthWest().lat()
  mapBounds.value = {
    north_east: [north, east],
    south_west: [south, west],
    north_west: [north, west],
    south_east: [south, east],
  }
}
</script>

<template>
  <VApp>
    <VMain>
      <div
        :class="useCss({
          position: 'relative',
        })"
      >
        <VSheet
          v-if="mapReady"
          :class="useCx(
            useCss({
              position: 'absolute',
              top: 16,
              left: 16,
              width: '30%',
              zIndex: 2020,
              padding: 16,
            }),
            'rounded-lg',
          )"
        >
          <div>
            <b>Map Ready</b>: {{ mapReady && 'Ready' }}
          </div>
          <div>
            <b>Zoom</b>: {{ mapZoom }}
          </div>
          <div>
            <b>Altitude</b>: {{ mapAlt && Math.round(mapAlt) }} meters
          </div>
          <div v-for="(mapBound, key) in mapBounds" :key="key">
            <div>
              <b>{{ key.split('_').map(k => useCapitalize(k)).join(' ') }}</b>: {{ mapBound.join(' ') }}
            </div>
          </div>
        </VSheet>
        <GoogleMap
          ref="map"
          api-key="AIzaSyCoKkiyHLRZZ-iHPWx-hTLWKvwXSaA70qs"
          :class="useCss({
            width: '100%',
            height: '100vh',
          })"
          :center="{
            lat: -1.212866,
            lng: 118.7380961,
          }"
          :zoom="5.57"
          :pan-control="false"
          :zoom-control="false"
          :scale-control="false"
          :rotate-control="false"
          :fullscreen-control="false"
          :map-type-control="false"
          :street-view-control="false"
          @zoom_changed="zoomChanged"
          @idle="boundsChanged"
        />
      </div>
    </VMain>
  </VApp>
</template>
