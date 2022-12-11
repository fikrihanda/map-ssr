<script lang="ts" setup>
import { VApp, VMain, VSheet } from 'vuetify/components'
import { GoogleMap } from 'vue3-google-map'

useHead({
  title: 'Map',
})

const bush = new BushMarker()
const geoLoc = useGeoLoc()

const isFirst = ref(true)
const map = ref<InstanceType<typeof GoogleMap> | null>(null)
const mapZoom = ref<number | null>(null)
const mapBounds = ref<{
  north_east: [number, number]
  south_west: [number, number]
  north_west: [number, number]
  south_east: [number, number]
} | null>(null)
const markers = ref<google.maps.Marker[]>([] as google.maps.Marker[])

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
  return altitudeMap(mapZoom.value)
})
const pelanggan = computedEager(() => geoLoc.getPelanggan)
const kecamatan = computedEager(() => geoLoc.kecamatan)
const kabupaten = computedEager(() => geoLoc.kabupaten)
const provinsi = computedEager(() => geoLoc.provinsi)
const kelurahan = computedEager(() => geoLoc.kelurahan)
const type = computedEager(() => geoLoc.getType)

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

const getGeoApi = useDebounce(async () => {
  if (!map.value)
    return
  if (!map.value.map)
    return
  if (!mapZoom.value)
    return
  if (!mapBounds.value)
    return
  try {
    const res = await geoLoc.getGeo({
      altitude: mapAlt.value ? (Math.round(mapAlt.value)).toString() : '190',
      list: (() => {
        return [
          mapBounds.value?.north_west.join('##'),
          mapBounds.value?.north_east.join('##'),
          mapBounds.value?.south_east.join('##'),
          mapBounds.value?.south_west.join('##'),
        ].join('@@')
      })(),
      baru: isFirst.value ? '1' : '0',
    })
    if (res?.prevType !== type.value)
      bush.clear()

    if (type.value === 'pelanggan') {
      bush.addMarkers(pelanggan.value?.lokasi.map((lok) => {
        return new google.maps.Marker({
          position: {
            lat: Number(lok.lat),
            lng: Number(lok.lng),
          },
        })
      }) ?? [])
    }
    if (type.value === 'kabupaten') {
      bush.addMarkers(kabupaten.value?.lokasi.map((lok) => {
        return new google.maps.Marker({
          position: {
            lat: Number(lok.lat),
            lng: Number(lok.lng),
          },
        })
      }) ?? [])
    }
    if (type.value === 'kecamatan') {
      bush.addMarkers(kecamatan.value?.lokasi.map((lok) => {
        return new google.maps.Marker({
          position: {
            lat: Number(lok.lat),
            lng: Number(lok.lng),
          },
        })
      }) ?? [])
    }
    if (type.value === 'provinsi') {
      bush.addMarkers(provinsi.value?.lokasi.map((lok) => {
        return new google.maps.Marker({
          position: {
            lat: Number(lok.lat),
            lng: Number(lok.lng),
          },
        })
      }) ?? [])
    }
    if (type.value === 'kelurahan') {
      bush.addMarkers(kelurahan.value?.lokasi.map((lok) => {
        return new google.maps.Marker({
          position: {
            lat: Number(lok.lat),
            lng: Number(lok.lng),
          },
        })
      }) ?? [])
    }
    if (isFirst.value)
      isFirst.value = false
  }
  catch (err) {}
}, 500)

const onIdle = async function () {
  boundsChanged()
  await getGeoApi()
}

watch(mapReady, (val) => {
  if (!map.value)
    return
  if (val) {
    bush.addMap(map.value.map as google.maps.Map)
    zoomChanged()
    boundsChanged()
    getGeoApi()
  }
})
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
              width: 450,
              maxWidth: 'calc(100% - 36px)',
              padding: 16,
              zIndex: 2020,
            }),
            'rounded-lg',
          )"
        >
          <div>
            <b>Map is ready</b>: {{ mapReady && 'Ready' }}
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
            lat: -6.3426762,
            lng: 106.7868379,
          }"
          :zoom="20"
          :pan-control="false"
          :zoom-control="false"
          :scale-control="false"
          :rotate-control="false"
          :fullscreen-control="false"
          :map-type-control="false"
          :street-view-control="false"
          :styles="mapStyles"
          map-id=""
          @zoom_changed="zoomChanged"
          @idle="onIdle"
        />
      </div>
    </VMain>
  </VApp>
</template>
