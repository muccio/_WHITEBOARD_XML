# Research: PITFALLS

**Question:** Common mistakes when adding PWA & Offline to a static app?

**Findings:**
- **Scope limitation:** Placing `sw.js` in `js/` instead of `/` limits its ability to cache the root HTML files.
- **Cache Staling:** Failing to version the cache name (`const CACHE_NAME = 'v1';`) meaning users never see new updates.
- **Opaque Responses:** Caching CDN assets can lead to opaque responses which eat up quota. Localizing assets (vendor dir) prevents this.
- **Install event blocking:** If one file fails to fetch during the SW `install` event, the whole SW fails to install.

**Consumer Guidance:**
Implement a robust cache versioning string and ensure the `vendor/` migration happens before testing the SW.
