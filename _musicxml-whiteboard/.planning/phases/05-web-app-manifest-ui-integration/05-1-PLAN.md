---
wave: 1
depends_on: []
files_modified: ["manifest.json", "index.html", "view3d.html", "css/style.css", "js/pwa.js"]
autonomous: true
---

# Plan 5-1: Web App Manifest & UI Integration

## Tasks

<task>
<action>
Generate a 512x512 app icon using `generate_image`. Create `icons/` directory and save it as `icon-512x512.png`. Create a scaled down version for `icon-192x192.png`.
</action>
<read_first>
- .planning/phases/05-web-app-manifest-ui-integration/05-CONTEXT.md
</read_first>
<acceptance_criteria>
- `icons/icon-512x512.png` and `icons/icon-192x192.png` exist.
</acceptance_criteria>
</task>

<task>
<action>
Create `manifest.json` at the root directory containing `name`, `short_name`, `start_url`, `display: "standalone"`, `background_color`, `theme_color`, and paths to the `icons/` directory.
</action>
<read_first>
- .planning/phases/05-web-app-manifest-ui-integration/05-CONTEXT.md
</read_first>
<acceptance_criteria>
- `manifest.json` exists and contains required PWA fields.
</acceptance_criteria>
</task>

<task>
<action>
Update `css/style.css` to include styles for:
- `.status-badge` and `.status-dot` (green for online, red for offline)
- `.toast-container` (fixed positioning at bottom center)
- `.toast` (animations for showing/hiding temporary messages)
- Make `#btn-install` styled correctly.
</action>
<read_first>
- css/style.css
</read_first>
<acceptance_criteria>
- CSS classes for PWA UI exist.
</acceptance_criteria>
</task>

<task>
<action>
Update `index.html` and `view3d.html` to include `<link rel="manifest" href="manifest.json">`.
In `index.html`, add `<button id="btn-install" class="btn-custom hidden">📲 Installa App</button>` and `<div id="connection-status" class="status-badge online" title="Online"><span class="status-dot"></span></div>` to the `.controls-panel`.
Add `<div id="toast-container"></div>` inside the `body`.
Include `<script src="js/pwa.js"></script>` at the end of the body.
</action>
<read_first>
- index.html
</read_first>
<acceptance_criteria>
- HTML structure contains the new elements.
</acceptance_criteria>
</task>

<task>
<action>
Create `js/pwa.js` with logic to:
- Listen to `beforeinstallprompt`, save the event, and unhide `#btn-install`.
- Listen to `#btn-install` click, trigger `prompt()`, and hide the button.
- Listen to `window.online` and `window.offline` events.
- Change `#connection-status` classes between `online` and `offline`.
- Display a temporary toast notification when connection state changes.
</action>
<read_first>
- .planning/phases/05-web-app-manifest-ui-integration/05-CONTEXT.md
</read_first>
<acceptance_criteria>
- `js/pwa.js` exists and handles the logic correctly.
</acceptance_criteria>
</task>

## Verification
- Manifest is correctly linked and loadable.
- Offline and online events trigger UI updates.
