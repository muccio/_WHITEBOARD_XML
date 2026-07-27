# Research: STACK

**Question:** What stack additions/changes are needed for PWA & Offline Support?

**Findings:**
- **Web App Manifest:** A simple JSON file (`manifest.json`) linked in the HTML head.
- **Service Worker:** Native browser API (`sw.js`). No external libraries required.
- **Asset Localization:** We need to replace all external CDN links with local equivalents inside a `vendor/` or `lib/` directory.
- **Caching Strategy:** Service Worker Cache API for `Cache-First` serving.

**Consumer Guidance:**
Do not introduce Workbox or other SW libraries. Keep it Vanilla JS to maintain the zero-build philosophy.
