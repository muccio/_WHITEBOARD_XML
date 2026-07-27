# Requirements

**Analysis Date:** 2026-07-18

## v1.1 Requirements

### Asset Localization (ASSET)
- [ ] **ASSET-01**: All external script dependencies (OpenSheetMusicDisplay, html2canvas, jsPDF, Three.js) are loaded from a local `vendor/` directory instead of CDNs.
- [ ] **ASSET-02**: All external font and CSS dependencies are served locally.

### Progressive Web App (PWA)
- [ ] **PWA-01**: A valid `manifest.json` is provided, defining app name, icons, and standalone display mode.
- [ ] **PWA-02**: User is prompted to install the app via an "Install App" button inside the UI, responding to the `beforeinstallprompt` event.

### Offline Caching (SYNC)
- [ ] **SYNC-03**: A Service Worker (`sw.js`) intercepts network requests and serves all static files from a local cache (Cache-First strategy).
- [ ] **SYNC-04**: The Service Worker automatically pre-caches all required files during the `install` event with versioned cache control.
- [ ] **SYNC-05**: The UI displays a visual indicator when the network connection goes offline or comes back online.

## Future Requirements (Deferred)
- [ ] Background sync API for offline document modifications (not required for static local saves).

## Out of Scope
- Backend synchronization or cloud storage APIs (the app must remain fully local and self-contained).
- Complex indexedDB storage layers for user data (local saving via JSON download remains the primary storage method).

## Traceability Matrix

| Requirement ID | Phase | Plan File | Verification State |
|----------------|-------|-----------|--------------------|
| ASSET-01 | Phase 4 | | Pending |
| ASSET-02 | Phase 4 | | Pending |
| PWA-01 | Phase 5 | | Pending |
| PWA-02 | Phase 5 | | Pending |
| SYNC-05 | Phase 5 | | Pending |
| SYNC-03 | Phase 6 | | Pending |
| SYNC-04 | Phase 6 | | Pending |

---
*Requirements definition: 2026-07-18*
