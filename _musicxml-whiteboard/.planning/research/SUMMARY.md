# Research Summary: PWA & Offline Support

**Stack additions:**
- Native Service Worker (`sw.js`) and Web App Manifest (`manifest.json`).
- `vendor/` directory for localized CDN dependencies (OpenSheetMusicDisplay, Three.js, jsPDF, html2canvas).

**Feature table stakes:**
- `Cache-First` offline serving.
- In-app "Install PWA" prompt handling via `beforeinstallprompt`.
- UI network status indicators (`window.onoffline`).

**Watch Out For:**
- Place `sw.js` at the root directory to ensure full scope coverage.
- Implement explicit cache versioning (`v1`) to manage future application updates.
- Ensure all vendor files are successfully downloaded locally, as a missing file during the `install` phase will abort Service Worker installation.
