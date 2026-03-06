# Map Tile Shuffle: SpeedGeeking at Esri Dev&Tech Summit 2026
A lightweight web app that turns any real location into a playable tile puzzle using ArcGIS geocoding (autosuggest + geocode) and static basemap tiles.

## App preview
<img width="805" height="610" alt="image" src="https://github.com/user-attachments/assets/035ef613-28b1-49fd-b0e6-dffd0ccb1dd9" />

## What this is

Type a place, pick a suggestion, hit **Generate**, and you get a shuffled map tile puzzle. You can change:

- **Basemap style**
- **Zoom**
- **Grid size** (2x2 through 5x5)
- **Reshuffle** for a new challenge

## Live demo

- Run it locally: Download or clone this repo then open `index.html` in your browser
- Try it here: [https://arcgis-puzzle-game.netlify.app](https://arcgis-puzzle-game.netlify.app)

## Configure your API key

In `index.html`, find:

```js
const ARCGIS_TOKEN = 'YOUR_ARCGIS_TOKEN'
