---
wave: 1
depends_on: []
files_modified: ["scripts/fetch-vendors.sh", "index.html", "view3d.html", "audio-tool.html", "css/style.css"]
autonomous: true
---

# Plan 4-1: Asset Localization & Migration

## Tasks

<task>
<action>
Create `scripts/fetch-vendors.sh` to download external assets locally:
- `mkdir -p vendor/fonts`
- curl the JS libraries (OpenSheetMusicDisplay, html2canvas, jsPDF, Three.js, OrbitControls) into `vendor/`.
- curl the Google Fonts (Outfit woff2 files) into `vendor/fonts/`.
- `chmod +x scripts/fetch-vendors.sh`
</action>
<read_first>
- .planning/phases/04-asset-localization-migration/04-CONTEXT.md
</read_first>
<acceptance_criteria>
- `scripts/fetch-vendors.sh` exists and is executable.
</acceptance_criteria>
</task>

<task>
<action>
Run `scripts/fetch-vendors.sh` to download the assets into `vendor/`.
</action>
<read_first>
- scripts/fetch-vendors.sh
</read_first>
<acceptance_criteria>
- `vendor/opensheetmusicdisplay.min.js` exists.
- `vendor/html2canvas.min.js` exists.
- `vendor/jspdf.umd.min.js` exists.
- `vendor/three.min.js` exists.
- `vendor/OrbitControls.js` exists.
- `vendor/fonts/outfit-regular.woff2` exists (and other weights).
</acceptance_criteria>
</task>

<task>
<action>
Update `index.html` to point to local `vendor/` files:
- Replace `https://cdn.jsdelivr.net/npm/opensheetmusicdisplay@1.6.1/build/opensheetmusicdisplay.min.js` with `vendor/opensheetmusicdisplay.min.js`
- Replace `https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js` with `vendor/html2canvas.min.js`
- Replace `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js` with `vendor/jspdf.umd.min.js`
</action>
<read_first>
- index.html
</read_first>
<acceptance_criteria>
- `index.html` has no `https://cdn...` or `https://cdnjs...` links.
</acceptance_criteria>
</task>

<task>
<action>
Update `view3d.html` to point to local `vendor/` files:
- Remove Google Fonts `<link>` tags.
- Replace `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` with `vendor/three.min.js`
- Replace `https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js` with `vendor/OrbitControls.js`
- Replace `https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js` with `vendor/html2canvas.min.js`
</action>
<read_first>
- view3d.html
</read_first>
<acceptance_criteria>
- `view3d.html` has no `https://` script or font imports.
</acceptance_criteria>
</task>

<task>
<action>
Update `css/style.css` and `view3d.html` (internal styles) to use local fonts:
- Define `@font-face` for Outfit referencing `../vendor/fonts/outfit-regular.woff2`, etc. in `css/style.css`.
- Define `@font-face` for Outfit referencing `vendor/fonts/outfit-regular.woff2`, etc. in `view3d.html` `<style>`.
- Remove any Google Font `@import` rules if they exist.
</action>
<read_first>
- css/style.css
- view3d.html
</read_first>
<acceptance_criteria>
- `@font-face` rules are correctly defined with local `vendor/fonts/` paths.
</acceptance_criteria>
</task>

## Verification
- No external CDNs should remain referenced in HTML and CSS.
