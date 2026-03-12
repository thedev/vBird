# vBird 🐦

A **Progressive Web App (PWA)** for recording bird observations via voice and exporting eBird-compliant CSV files.

## Features

- 🎤 **Voice Input** – Say "Three Blue Jays" and it records `3 × Blue Jay`
- 📋 **Checklist View** – Edit or delete observations with large, touch-friendly list items
- 📤 **eBird CSV Export** – Exports in the official eBird Record Format
- 📴 **Offline-Capable** – Service worker + IndexedDB means it works with no internet
- 🏠 **Add to Home Screen** – Installable PWA with full-screen support

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Voice | Web Speech API (`webkitSpeechRecognition`) |
| Offline Storage | IndexedDB via [Dexie.js](https://dexie.org/) |
| PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) + Workbox |
| Deployment | GitHub Pages via GitHub Actions |

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173/vBird/`.

## Build & Deploy

```bash
npm run build   # produces dist/
```

Push to `main` to trigger the GitHub Pages deployment pipeline.

## Voice Parsing Examples

| You say | vBird records |
|---|---|
| "Three Blue Jays" | 3 × Blue Jay |
| "Ten Crows" | 10 × American Crow |
| "1 Bald Eagle" | 1 × Bald Eagle |
| "A dozen House Sparrows" | 12 × House Sparrow |
| "Several Mallards" | 5 × Mallard |

## eBird CSV Format

Exported CSV headers: `Common Name, Count, Location, Date, Start Time, Protocol, Duration (mins), Distance (km)`
