# External Integrations

This document describes the external APIs, integrations, and services utilized by the MusicXML Whiteboard Pro 3D project.

## Network Dependencies & APIs
The application is designed to be completely client-side and offline-capable, with the exception of loading external libraries from Content Delivery Networks (CDNs). There are no external REST APIs, WebSockets, or backend databases used.

## Content Delivery Networks (CDNs)
The project dynamically loads specific versions of essential dependencies via CDN links embedded in the HTML `script` tags:

1. **jsDelivr (OpenSheetMusicDisplay)**
   - **URL**: `https://cdn.jsdelivr.net/npm/opensheetmusicdisplay@1.6.1/build/opensheetmusicdisplay.min.js`
   - **Purpose**: Used for rendering complex MusicXML notation directly onto the DOM in `js/musicxml.js`.

2. **Cloudflare CDNJS (html2canvas)**
   - **URL**: `https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js`
   - **Purpose**: Assists `js/project.js` in taking rasterized snapshots of HTML elements (like `#patch-gallery`) to compose PDF exports.

3. **Cloudflare CDNJS (jsPDF)**
   - **URL**: `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`
   - **Purpose**: Used for generating downloadable PDF files natively in the browser inside `js/project.js`.

## Native Browser Web APIs
Instead of external service integrations, the app integrates heavily with native Web APIs provided by modern browsers:
- **Web Audio API**: In `audio-tool.html`, utilized for processing local audio files, executing Cooley-Tukey Radix-2 FFT calculation, and graphing audio features.
- **SVG DOM API**: Used extensively by `js/svg-engine.js` for dynamic vector graphics creation (lines, Bezier curves, text, circles) and mirroring.
- **Canvas API**: Used in `js/ui.js` for timeline generation and in `view3d.html` for rendering static 3D textures.
- **File API & FileReader**: Used in `js/project.js` and `js/musicxml.js` to process local JSON project files, XML sheet files, and local audio tracks without requiring an upload server.
