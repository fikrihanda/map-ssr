<script lang="ts" setup>
import { CustomMarker, GoogleMap } from 'vue3-google-map'
import type { LatLgnExtend } from '~~/utils/rbush'

useHead({
  title: 'Map: Versi 2',
})

const config = useRuntimeConfig()
const geo = useGeoLocV1()

const { pending } = useAsyncData(async () => await geo.getGeo({
  idWilayah: '',
}), {
  lazy: true,
})

const typeCheck = ['pelanggan', 'kelurahan', 'kecamatan', 'kabupaten', 'provinsi']
const map = ref<InstanceType<typeof GoogleMap> | null>(null)
const mapZoom = ref<number | null>(null)
const markers = ref<LatLgnExtend[]>([])
const isZoomIn = ref(false)
const type = ref('provinsi')

const mapAlt = computed(() => {
  if (!map.value)
    return null
  if (!mapZoom.value)
    return null
  return altitudeMap(mapZoom.value)
})

const mapReady = computed(() => {
  if (!map.value)
    return false
  return map.value.ready
})

const pelanggan = computed(() => geo.getGeoPelanggan)
const kecamatan = computed(() => geo.getGeoKecamatan)
const kabupaten = computed(() => geo.getGeoKabupaten)
const provinsi = computed(() => geo.getGeoPronvisi)
const kelurahan = computed(() => geo.getGeoKelurahan)
const colorChange = computedEager(() => {
  if (type.value === 'provinsi')
    return '#d32f2f'
  if (type.value === 'kabupaten')
    return '#512da8'
  if (type.value === 'kecamatan')
    return '#00796b'
  if (type.value === 'kelurahan')
    return '#1976d2'
  return ''
})

const bush = new BushMarker()

const zoomChanged = function () {
  mapZoom.value = map.value?.map?.getZoom() ?? null
}

const markerTreeFun = function () {
  const mapa = bush.markerTree.all().map(({ marker }) => marker)
  return mapa
}

const onIdle = function () {
  if (!map.value)
    return
  if (!map.value.map)
    return

  if (mapZoom.value === null)
    return
  if (mapAlt.value === null)
    return

  if (mapZoom.value >= 16) {
    if (pelanggan.value) {
      type.value = 'pelanggan'
      bush.clear()
      bush.addMarkers(pelanggan.value.lokasi)
    }
  }
  else if (mapZoom.value >= 13) {
    if (kelurahan.value) {
      type.value = 'kelurahan'
      bush.clear()
      bush.addMarkers(kelurahan.value.lokasi)
    }
  }
  else if (mapZoom.value >= 10) {
    if (kecamatan.value) {
      type.value = 'kecamatan'
      bush.clear()
      bush.addMarkers(kecamatan.value.lokasi)
    }
  }
  else if (mapZoom.value >= 7) {
    if (kabupaten.value) {
      type.value = 'kabupaten'
      bush.clear()
      bush.addMarkers(kabupaten.value.lokasi)
    }
  }
  else {
    if (provinsi.value) {
      type.value = 'provinsi'
      bush.clear()
      bush.addMarkers(provinsi.value.lokasi)
    }
  }

  bush._redraw()
  markers.value = markerTreeFun()
}

const clusterCss = function (warna: string) {
  return useCss({
    'position': 'relative',
    'display': 'flex',
    'alignItems': 'center',
    'justifyContent': 'center',
    'width': '35px',
    'height': '35px',
    'borderRadius': '50%',
    'backgroundColor': warna,
    'transition': 'width height 2s',
    'cursor': 'pointer',
    'color': 'white',
    '&:before, &:after': {
      content: '" "',
      display: 'block',
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      top: '50%',
      left: '50%',
      borderRadius: '50%',
      backgroundColor: warna,
    },
    '&:before': {
      width: '40px',
      height: '40px',
      opacity: 0.4,
      zIndex: -1,
    },
    '&:after': {
      width: '45px',
      height: '45px',
      opacity: 0.2,
      zIndex: -1,
    },
  })
}

const clickGeo = async function (ll: LatLgnExtend) {
  if (!map.value)
    return
  if (!map.value.map)
    return
  try {
    await geo.getGeo({
      idWilayah: ll.id as string,
    })
    map.value.map.setCenter(usePick(ll, ['lat', 'lng']))
    const findIndex = typeCheck.findIndex(v => v === type.value)
    const ty = typeCheck[findIndex - 1]
    type.value = ty
    if (type.value === 'kabupaten') {
      bush.clear()
      bush.addMarkers(kabupaten.value?.lokasi ?? [])
    }
    if (type.value === 'kecamatan') {
      bush.clear()
      bush.addMarkers(kecamatan.value?.lokasi ?? [])
    }
    if (type.value === 'kelurahan') {
      bush.clear()
      bush.addMarkers(kelurahan.value?.lokasi ?? [])
    }
    if (type.value === 'pelanggan') {
      bush.clear()
      bush.addMarkers(pelanggan.value?.lokasi ?? [])
    }
    const all = markerTreeFun()
    const bounds = new google.maps.LatLngBounds()
    all.forEach((marker) => {
      bounds.extend(marker)
    })
    map.value.map.fitBounds(bounds)
  }
  catch (err) {}
}

watch(mapZoom, (cur, prev) => {
  if (cur === null || prev === null)
    return
  isZoomIn.value = cur > prev
})

watch(pending, (val) => {
  if (!val) {
    bush.clear()
    bush.addMarkers(provinsi.value?.lokasi ?? [])
    const all = markerTreeFun()
    const bounds = new google.maps.LatLngBounds()
    all.forEach((marker) => {
      bounds.extend(marker)
    })
    map.value?.map?.fitBounds(bounds)
  }
})

watch(mapReady, (val) => {
  if (!map.value)
    return
  if (val)
    bush.addMap(map.value.map as google.maps.Map)
})
</script>

<template>
  <div
    :class="useCss({
      position: 'relative',
    })"
  >
    <GoogleMap
      ref="map"
      :api-key="config.public.mapKey"
      :class="useCss({
        width: '100%',
        height: '100vh',
      })"
      :center="{
        lat: -0.9277539,
        lng: 118.4065739,
      }"
      :zoom="5.17"
      :pan-control="false"
      :zoom-control="false"
      :scale-control="false"
      :rotate-control="false"
      :fullscreen-control="false"
      :map-type-control="false"
      :street-view-control="false"
      :styles="mapStyles"
      @zoom_changed="zoomChanged"
      @idle="onIdle"
    >
      <template v-for="(latlng, i) in markers" :key="i">
        <CustomMarker
          v-if="type !== 'pelanggan'"
          :options="{ position: latlng }"
        >
          <div
            :id="`marker-${i}`"
            :class="clusterCss(colorChange)"
            @click="clickGeo(latlng)"
          >
            {{ numberUnit(latlng.jumlah ?? 0, 0) }}
          </div>
        </CustomMarker>
        <CustomMarker v-else :options="{ position: latlng }">
          <div
            :style="{
              width: '10px',
              height: '10px',
              backgroundColor: 'red',
              borderRadius: '50%',
              border: '1px solid black',
              cursor: 'pointer',
            }"
          />
        </CustomMarker>
      </template>
    </GoogleMap>
  </div>
</template>