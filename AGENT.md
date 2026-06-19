# World Cup 2026 — Agent Context

Electron desktop app showing FIFA World Cup 2026 live scores and fixtures. macOS-first (hiddenInset titlebar, traffic lights). Single-window, 480×820px.

## Stack

- **Electron 42** — main process in `main.js`, renderer in `index.html`
- **No build step** — pure HTML/CSS/JS renderer, no bundler, no framework
- **Data source** — ESPN public API (`site.api.espn.com`), fetched directly from the renderer via `fetch()`. No backend.
- **preload.js** — minimal; only exposes `window.versions` (node/electron). No Node APIs in renderer.

## Commands

```bash
npm install   # first time only — installs Electron
npm start     # launches the app (runs: electron .)
npm run build # packages a macOS .app via electron-builder
```

## Architecture

| File | Role |
|---|---|
| `main.js` | Creates BrowserWindow (480×820), loads `index.html`, sets app menu |
| `preload.js` | Exposes `window.versions` via contextBridge; contextIsolation enabled, nodeIntegration disabled |
| `index.html` | All UI + logic in one file — styles, HTML template, and script |

## Data flow

1. On boot, renderer fetches today's scores (`TODAY_URL`) and the full tournament schedule (`SCHED_URL`, Jun 11–Jul 20 2026, 120 events) in parallel.
2. Today's scores refresh every **30 seconds**; full schedule refreshes every **10 minutes**.
3. If ESPN is unreachable, an error banner appears and cached data is shown.
4. `mapGame()` normalises ESPN event objects. `render()` rebuilds the DOM from cached data each cycle (scroll position is preserved).

## Key details

- Window uses `hiddenInset` titlebar with traffic lights at `{ x: 14, y: 14 }`
- Titlebar and header are draggable (`-webkit-app-region: drag`); refresh button opts out (`no-drag`)
- On macOS, closing the window doesn't quit the app (standard macOS behaviour)
- No devtools shortcut in the menu — use `View > Reload` or add one manually during development
- `electron-builder` is listed only as a dev-time script dep; it must be installed separately if needed (`npm install --save-dev electron-builder`)

## Verifying changes

Never launch the app, drive it with Playwright/Electron automation, or take screenshots yourself to verify a change. Make the code change, explain how to check it, and ask the user to open the app and verify visually themselves.
