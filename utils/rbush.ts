import RBush from 'rbush'

export interface Box {
  minX: number
  minY: number
  maxX: number
  maxY: number
  marker: google.maps.Marker
}

export class BushMarker {
  private _map = null as google.maps.Map | null
  private _markers = [] as google.maps.Marker[]
  private _markersTree = new RBush<Box>()
  private _positionsTree = new RBush<Box>()

  addMap(map: google.maps.Map) {
    this._map = map
  }

  addMarker(marker: google.maps.Marker) {
    const { markerBox, positionBox, isVisible } = this._addMarker(marker)
    if (markerBox && isVisible)
      this._markersTree.insert(markerBox)
    if (positionBox)
      this._positionsTree.insert(positionBox)
  }

  addMarkers(markers: google.maps.Marker[]) {
    const markerBoxes = [] as Box[]
    const positionBoxes = [] as Box[]

    markers.forEach((marker) => {
      const { markerBox, positionBox, isVisible } = this._addMarker(marker)
      if (markerBox && isVisible)
        markerBoxes.push(markerBox)

      if (positionBox)
        positionBoxes.push(positionBox)
    })

    this._markersTree.load(markerBoxes)
    this._positionsTree.load(positionBoxes)
  }

  clear() {
    this._markers.forEach((marker) => {
      marker.setMap(null)
    })
    this._positionsTree = new RBush()
    this._markersTree = new RBush()
    this._markers = []
    this._redraw()
  }

  _redraw() {
    if (!this._map)
      return
    if (!this._positionsTree)
      return
    const mapBounds = this._map.getBounds() as google.maps.LatLngBounds
    const mapBoundsBox = {
      minX: mapBounds.getSouthWest().lng(),
      minY: mapBounds.getSouthWest().lat(),
      maxX: mapBounds.getNorthEast().lng(),
      maxY: mapBounds.getNorthEast().lat(),
    }

    const map = this._map
    const markers = [] as Box[]

    this._markers.forEach((marker) => {
      marker.setMap(null)
    })

    const ms = this._positionsTree.search(mapBoundsBox)

    ms.forEach(({ marker }) => {
      const latLng = marker.getPosition() as google.maps.LatLng
      const projection = map.getProjection() as google.maps.Projection
      const point = projection.fromLatLngToPoint(latLng) as google.maps.Point
      const { x, y } = point
      // const icon = marker.getIcon() as google.maps.Icon
      // const anchor = icon.anchor as google.maps.Point
      // const size = icon.size as google.maps.Size

      const markerBox = {
        minX: x,
        minY: y,
        maxX: x,
        maxY: y,
        marker,
      }

      markers.push(markerBox)
      this._drawMarker(marker)
    })

    this._markersTree.clear()
    this._markersTree.load(markers)
  }

  private _drawMarker(marker: google.maps.Marker) {
    marker.setMap(this._map)
  }

  private _addMarker(marker: google.maps.Marker) {
    if (!this._map)
      return { markerBox: null, positionBox: null, isVisible: null }

    const getBounds = this._map.getBounds()
    if (!getBounds)
      return { markerBox: null, positionBox: null, isVisible: null }

    const latLng = marker.getPosition() as google.maps.LatLng
    const isVisible = getBounds.contains(latLng)
    const projection = this._map.getProjection() as google.maps.Projection
    const point = projection.fromLatLngToPoint(latLng) as google.maps.Point
    const { x, y } = point

    if (isVisible)
      this._drawMarker(marker)

    const markerBox = {
      minX: x,
      minY: y,
      maxX: x,
      maxY: y,
      marker,
    }

    const positionBox = {
      minX: latLng.lng(),
      minY: latLng.lat(),
      maxX: latLng.lng(),
      maxY: latLng.lat(),
      marker,
    }

    this._markers.push(marker)

    return { markerBox, positionBox, isVisible }
  }
}
