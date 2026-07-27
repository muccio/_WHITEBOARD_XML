# Phase 6: Service Worker Offline Engine

## Domain
Service Worker integration, offline caching strategies, and asset versioning.

## Decisions

### Caching Strategy (SYNC-03, SYNC-04)
- **Decision:** Strict Pre-cache + Dynamic Fallback (Cache-First).
- **Behavior:** On `install`, pre-cache all known core files (HTML, CSS, JS, Vendor libs, Fonts). On `fetch`, intercept requests and serve from cache if available. If not, fetch from network and dynamically add the response to the cache.

### Versioning
- **Decision:** Use a hardcoded `CACHE_NAME` constant in `sw.js` (e.g., `'musicxml-wb-v1'`).
- **Behavior:** The `activate` event will check all existing caches and delete any that do not match the current `CACHE_NAME`, ensuring updates clear stale assets.

### Registration
- **Decision:** Service Worker registration code will reside in `js/pwa.js`.
- **Behavior:** `navigator.serviceWorker.register('sw.js')` will be invoked on window load.

## Canonical Refs
- Requirements: SYNC-03, SYNC-04

## Deferred Ideas
None.
