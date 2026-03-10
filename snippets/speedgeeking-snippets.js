// Assumes globals from index.html: ARCGIS_TOKEN, BASE_URL, GEOCODE_BASE, CURRENT_STYLE, CURRENT_UI_ZOOM, CURRENT_GRID_SIZE

const url = (path, params) =>
  `${GEOCODE_BASE}/${path}?` + new URLSearchParams({ ...params, token: ARCGIS_TOKEN })
const get = u => fetch(u).then(r => r.json())

// ===== 1) AUTOSUGGEST =====
const suggestLocations = async text =>
  (await get(url('suggest', { f: 'pjson', text, maxSuggestions: 6 }))).suggestions || []

// ===== 2) GEOCODE (magicKey optional) =====
const geocode = async (singleLine, magicKey = '') => {
  const data = await get(
    url('findAddressCandidates', { f: 'pjson', SingleLine: singleLine, magicKey, maxLocations: 1, outSR: 4326 })
  )
  const c = data.candidates?.[0]
  return c ? { lat: c.location.y, lon: c.location.x, address: c.address } : null
}

// ===== 3) TILE MATH =====
const latLonToTile = (lat, lon, z) => {
  const n = 2 ** z
  const rad = (lat * Math.PI) / 180
  return {
    z,
    x: Math.floor(((lon + 180) / 360) * n),
    y: Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n)
  }
}

// ===== 4) SINGLE TILE URL =====
// Static tiles use {z,y,x} and are 512x512 PNGs
const tileUrl = (z, x, y) =>
  `${BASE_URL}/${CURRENT_STYLE}/static/tile/${z}/${y}/${x}?token=${ARCGIS_TOKEN}`

// ===== 5) NxN GRID =====
const makeTiles = (lat, lon) => {
  const z = Math.max(0, CURRENT_UI_ZOOM - 1)
  const anchor = latLonToTile(lat, lon, z)
  const half = Math.floor(CURRENT_GRID_SIZE / 2)

  const tiles = []
  for (let r = 0; r < CURRENT_GRID_SIZE; r++) {
    for (let c = 0; c < CURRENT_GRID_SIZE; c++) {
      const x = anchor.x + (c - half)
      const y = anchor.y + (r - half)
      tiles.push({ url: tileUrl(z, x, y) })
    }
  }
  return tiles
}
