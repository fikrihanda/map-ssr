<script lang="ts" setup>
import { VBtn, VCard, VCardItem, VCardSubtitle, VMenu } from 'vuetify/components'
import { CustomMarker, GoogleMap } from 'vue3-google-map'
import { LatLgnExtend } from '~~/utils/rbush'

useHead({
  title: 'Map: Versi 2',
})

const config = useRuntimeConfig()
const geo = useGeoLocV1()

const zoomCheck = [14, 11, 9, 7, 5]
const typeCheck = ['pelanggan', 'kelurahan', 'kecamatan', 'kabupaten', 'provinsi']
const map = ref<InstanceType<typeof GoogleMap> | null>(null)
const mapZoom = ref<number | null>(null)
const markers = ref<LatLgnExtend[]>([])
const isZoomOut = ref(false)
const type = ref('provinsi')
const isFirst = ref(true)
const selected = ref<LatLgnExtend | null>(null)
const menuOpen = ref(false)

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
  console.log(mapZoom.value)
}

const markerTreeFun = function () {
  const mapa = bush.markerTree.all().map(({ marker }) => marker)
  return mapa
}

const onIdle = async function () {
  if (!map.value)
    return
  if (!map.value.map)
    return

  if (mapZoom.value === null)
    return
  if (mapAlt.value === null)
    return

  if (isFirst.value) {
    await geo.getGeo({
      idWilayah: '',
    })
    bush.clear()
    bush.addMarkersToAllAdd(provinsi.value?.lokasi ?? [])

    markers.value = markerTreeFun()
    isFirst.value = false
  }

  if (mapZoom.value >= zoomCheck[0]) {
    if (pelanggan.value) {
      type.value = 'pelanggan'
      bush.clear()
      bush.addMarkersToAllAdd(pelanggan.value.lokasi)
    }
  }
  else if (mapZoom.value >= zoomCheck[1]) {
    if (kelurahan.value) {
      type.value = 'kelurahan'
      bush.clear()
      bush.addMarkersToAllAdd(kelurahan.value.lokasi)
    }
  }
  else if (mapZoom.value >= zoomCheck[2]) {
    if (kecamatan.value) {
      type.value = 'kecamatan'
      bush.clear()
      bush.addMarkersToAllAdd(kecamatan.value.lokasi)
    }
  }
  else if (mapZoom.value >= zoomCheck[3]) {
    if (kabupaten.value) {
      type.value = 'kabupaten'
      bush.clear()
      bush.addMarkersToAllAdd(kabupaten.value.lokasi)
    }
  }
  else {
    if (provinsi.value) {
      type.value = 'provinsi'
      bush.clear()
      bush.addMarkersToAllAdd(provinsi.value.lokasi)
    }
  }

  if (isZoomOut.value) {
    if (type.value === 'provinsi')
      geo.removeGeo(['kabupaten', 'kecamatan', 'kelurahan', 'pelanggan'])
    if (type.value === 'kabupaten')
      geo.removeGeo(['kecamatan', 'kelurahan', 'pelanggan'])
    if (type.value === 'kecamatan')
      geo.removeGeo(['kelurahan', 'pelanggan'])
    if (type.value === 'kelurahan')
      geo.removeGeo(['pelanggan'])
  }

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

const setSelected = function (ll: LatLgnExtend) {
  selected.value = ll
  menuOpen.value = true
}

const removeSelected = function () {
  selected.value = null
  menuOpen.value = false
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
      bush.addMarkersToAllAdd(kabupaten.value?.lokasi ?? [])
    }
    if (type.value === 'kecamatan') {
      bush.clear()
      bush.addMarkersToAllAdd(kecamatan.value?.lokasi ?? [])
    }
    if (type.value === 'kelurahan') {
      bush.clear()
      bush.addMarkersToAllAdd(kelurahan.value?.lokasi ?? [])
    }
    if (type.value === 'pelanggan') {
      bush.clear()
      bush.addMarkersToAllAdd(pelanggan.value?.lokasi ?? [])
    }
    const all = bush.markers
    const bounds = new google.maps.LatLngBounds()
    all.forEach((marker) => {
      bounds.extend(marker)
    })
    const center = bounds.getCenter()
    map.value.map.setCenter(center)
    if (type.value !== 'provinsi') {
      // const zoomLevel = getBoundsZoomLevel(bounds, {
      //   height: innerHeight,
      //   width: innerWidth,
      // })
      // const checkZoom = zoomCheck[findIndex - 1]
      // console.log(zoomLevel, checkZoom, zoomLevel < checkZoom)
      // map.value.map.setZoom(checkZoom + 0.5)
      map.value.map.fitBounds(bounds)
    }
  }
  catch (err) {}
  menuOpen.value = false
}

watch(mapZoom, (cur, prev) => {
  if (cur === null || prev === null)
    return
  isZoomOut.value = cur < prev
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
          :id="`marker-${latlng.id}`"
          :options="{ position: latlng }"
          @mouseenter="setSelected(latlng)"
          @mouseleav="removeSelected"
        >
          <div
            :class="clusterCss(colorChange)"
          >
            {{ numberUnit(latlng.jumlah ?? 0, 0) }}
          </div>
        </CustomMarker>
        <CustomMarker v-else :id="`marker-${latlng.id}`" :options="{ position: latlng }">
          <img
            src="~~/assets/images/pelanggan.png"
            @mouseenter="setSelected(latlng)"
            @mouseleav="removeSelected"
          >
        </CustomMarker>
      </template>
    </GoogleMap>
    <VMenu
      v-if="selected"
      v-model="menuOpen"
      :activator="`#marker-${selected?.id ?? 0}`"
      :close-on-back="false"
      :close-on-content-click="false"
      :open-on-hover="true"
      z-index="2022"
      location="bottom center"
    >
      <VCard :min-width="100">
        <VCardSubtitle
          :class="useCx(
            useCss({
              paddingTop: 10,
            }), 'text-center',
          )"
        >
          {{ selected?.nama?.toUpperCase() }}
        </VCardSubtitle>
        <VCardItem>
          <VBtn block density="compact" color="primary" @click="clickGeo(selected as LatLgnExtend)">
            Click Here
          </VBtn>
        </VCardItem>
      </VCard>
    </VMenu>
  </div>
</template>
