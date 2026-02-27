# Chrome Side Panel Extension (Vite + React + Tailwind)

This repository contains a starter structure for a Chrome extension that uses a Side Panel as its only UI. The UI is built with React, styled with Tailwind CSS, and bundled using Vite. All code is plain JavaScript (JSX) as requested.

## Features
- Side panel only (no popup/tab)
- Tab navigation: Dashboard, Settings, Logs
- Last opened tab persisted with `chrome.storage.local`
- Modern clean UI, responsive layout, neutral colors

## Folder Structure
```
extension/
├── public/
│   └── manifest.json
├── public/
│   ├── background/                # static assets copied verbatim to build output
│   │   └── background.js          # service worker (minimal script)
├── src/
│   ├── background/                # original source folder (optional)
│   │   └── background.js
│   ├── sidepanel/
│   │   ├── SidePanel.jsx
│   │   ├── Tabs/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Logs.jsx
│   │   └── components/ (reserve for shared components)
│   ├── hooks/ (custom hooks go here)
│   ├── utils/ (utility functions)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## Setup Instructions
1. **Install dependencies**
   ```bash
   cd /Users/jcfaderanga/Desktop/extension
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```
   This starts Vite's dev server (typically on `http://localhost:5173`).

3. **Load unpacked extension in Chrome**
   - Open `chrome://extensions` and enable Developer mode.
   - Click *Load unpacked* and select the `/Users/jcfaderanga/Desktop/extension/public` folder.
   - If using the dev server, you can set `default_path` in `manifest.json` to the dev URL (e.g. `http://localhost:5173`), or simply build and load the `dist` output.

4. **Build for production**
   ```bash
   npm run build
   ```
   The output will be in `dist/`. Load that folder as an unpacked extension.

## Notes
- The side panel component persists the selected tab to `chrome.storage.local` on every change and reads it on mount.
- Tailwind CSS is configured for the `src` folder and the HTML template.
- The background script is a minimal service worker, required by Manifest V3. It lives under `public/background` so that it is included in the production `dist/` folder during the Vite build.

Feel free to extend the UI components, add real settings, and wire up future features.