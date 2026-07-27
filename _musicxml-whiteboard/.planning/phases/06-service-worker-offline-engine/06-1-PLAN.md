---
wave: 1
depends_on: []
files_modified: ["sw.js", "js/pwa.js", "view3d.html"]
autonomous: true
---

# Plan 6-1: Service Worker Offline Engine

## Tasks

<task>
<action>
Create `sw.js` at the project root.
Define `CACHE_NAME = 'musicxml-wb-v1'`.
Define an array of all static files to precache (`PRECACHE_URLS`), including HTML files, JS, CSS, fonts, vendor libraries, and icons.
Implement `install` event to wait until the cache is opened and populated with `PRECACHE_URLS`.
Implement `activate` event to delete any cache whose key does not match `CACHE_NAME`.
Implement `fetch` event using a Cache-First strategy (try cache, fallback to network, add network response to cache).
</action>
<read_first>
- .planning/phases/06-service-worker-offline-engine/06-CONTEXT.md
</read_first>
<acceptance_criteria>
- `sw.js` exists and handles the 3 core Service Worker events appropriately.
</acceptance_criteria>
</task>

<task>
<action>
Update `js/pwa.js` to register the service worker on load (`if ('serviceWorker' in navigator)`). 
Log success or failure to the console.
</action>
<read_first>
- js/pwa.js
</read_first>
<acceptance_criteria>
- Service worker registration code is present in `pwa.js`.
</acceptance_criteria>
</task>

<task>
<action>
Update `view3d.html` to include `<script src="js/pwa.js"></script>` and `<div id="toast-container"></div>` at the end of the body, so it behaves correctly as a PWA entry point and handles offline toasts.
</action>
<read_first>
- view3d.html
</read_first>
<acceptance_criteria>
- `view3d.html` includes `pwa.js` and the toast container.
</acceptance_criteria>
</task>

## Verification
- `sw.js` is installed and activated.
- Cache storage is populated.
- Offline mode loads the page.
