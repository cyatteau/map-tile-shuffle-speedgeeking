/**
 * These snippets are copied from index.html and assume these globals exist there:
 *   ARCGIS_TOKEN, BASE_URL, GEOCODE_BASE,
 *   CURRENT_STYLE, CURRENT_UI_ZOOM, CURRENT_GRID_SIZE
 */

// ===== 1) AUTOSUGGEST =====
// ArcGIS Geocoding /suggest: autocomplete partial text into place/address suggestions.
async function suggestLocations(text) {
  const url =
    `${GEOCODE_BASE}/suggest` +
    `?f=pjson&maxSuggestions=6` +
    `&text=${encodeURIComponent(text)}` +
    `&token=${encodeURIComponent(ARCGIS_TOKEN)}`

  const res = await fetch(url)
  const data = await res.json()
  return data.suggestions || []
}

// ===== 2) GEOCODE (with magicKey) =====
// findAddressCandidates transforms text into a lat/lon candidate.
// Passing magicKey from /suggest can improve results and speed.
async function geocode(singleLine, magicKey = '') {
  const url =
    `${GEOCODE_BASE}/findAddressCandidates` +
    `?f=pjson&maxLocations=1&outFields=*&outSR=4326` +
    `&SingleLine=${encodeURIComponent(singleLine)}` +
    (magicKey ? `&magicKey=${encodeURIComponent(magicKey)}` : '') +
    `&token=${encodeURIComponent(ARCGIS_TOKEN)}`

  const res = await fetch(url)
  const data = await res.json()
  const c = data.candidates?.[0]

  return {
    lat: c.location.y,
    lon: c.location.x,
    address: c.address
  }
}

// ===== 3) TILE MATH =====
// Convert lat/lon into Web Mercator tile coordinates at zoom z.
function latLonToTile(lat, lon, z) {
  const n = 2 ** z
  const rad = (lat * Math.PI) / 180
  return {
    x: Math.floor(((lon + 180) / 360) * n),
    y: Math.floor(
      ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n
    ),
    z
  }
}

// ===== 4) TILE URL BUILDER =====
// Static basemap tiles are 512x512 PNG tiles using {z,y,x}.
function tileUrl(z, x, y) {
  return `${BASE_URL}/${CURRENT_STYLE}/static/tile/${z}/${y}/${x}?token=${encodeURIComponent(
    ARCGIS_TOKEN
  )}`
}

// ===== 5) GRID GENERATION =====
// Build a NxN tile grid around the center tile (N = CURRENT_GRID_SIZE).
function makeTiles(lat, lon) {
  // Static basemap tiles zoom levels are effectively one less than many 256px schemes. https://developers.arcgis.com/rest/static-basemap-tiles/open-navigation-tile-get/#level
  const tileZoom = Math.max(0, CURRENT_UI_ZOOM - 1)

  const center = latLonToTile(lat, lon, tileZoom)
  const half = Math.floor(CURRENT_GRID_SIZE / 2)
  const tiles = []

  for (let r = 0; r < CURRENT_GRID_SIZE; r++) {
    for (let c = 0; c < CURRENT_GRID_SIZE; c++) {
      const x = center.x + (c - half)
      const y = center.y + (r - half)
      const id = `${center.z}/${y}/${x}`
      tiles.push({ id, url: tileUrl(center.z, x, y) })
    }
  }

  return tiles
}
