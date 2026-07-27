# Research: ARCHITECTURE

**Question:** How do PWA features integrate with existing architecture?

**Findings:**
- **New Components:**
  - `manifest.json` at root.
  - `sw.js` at root.
  - `vendor/` directory containing OSMD, Three.js, html2canvas, jsPDF, etc.
- **Integration Points:**
  - Registration script added to `main.js` or directly inside `index.html`.
  - Listeners for `offline` and `online` window events in `ui.js` or `main.js`.
- **Data Flow Changes:**
  - Network requests for assets will route through `sw.js` first.

**Consumer Guidance:**
Ensure `sw.js` is placed at the root directory so its scope covers both `/` (index) and `view3d.html`.
