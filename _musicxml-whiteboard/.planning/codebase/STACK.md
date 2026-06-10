# Technology Stack

**Analysis Date:** 2026-06-10

## Languages

**Primary:**
- JavaScript (ES6+) - Application logic in `js/` directory (`globals.js`, `history.js`, `main.js`, `musicxml.js`, `project.js`, `svg-engine.js`, and inline script in `audio-tool.html`).
- HTML5 - Page structures in `index.html`, `audio-tool.html`, and `manuale.html`.
- CSS3 - Visual styles in `css/style.css` and inline page rules.

**Secondary:**
- None.

## Runtime

**Environment:**
- Client-side Web Browser (requires Canvas API, Web Audio API, SVG DOM API, Pointer Events API).
- No backend runtime or local compilation/bundling.

**Package Manager:**
- None (external libraries are loaded via CDNs).
- Lockfile: None.

## Frameworks

**Core:**
- None (Vanilla JavaScript).

**Testing:**
- None.

**Build/Dev:**
- None.

## Key Dependencies

**Critical:**
- OpenSheetMusicDisplay v1.6.1 (CDN: `https://cdn.jsdelivr.net/npm/opensheetmusicdisplay@1.6.1/build/opensheetmusicdisplay.min.js`) - Renders MusicXML files to vector SVGs on the workspace canvas.
- html2canvas v1.4.1 (CDN: `https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js`) - Dynamically captures DOM and Canvas element screenshots for PDF rendering.
- jsPDF v2.5.1 (CDN: `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`) - Compiles screen captures into multi-track printable documents.

**Infrastructure:**
- Browser Web Audio API - Used in `audio-tool.html` to load files, perform Cooley-Tukey Radix-2 FFT calculation, and display real-time/static audio features.
- Browser SVG API - Used in `js/svg-engine.js` to draw vector elements, lines, circles, text, and Bezier curves.
- Browser Canvas API - Used in `js/ui.js` for timeline rendering (`#timeline-canvas` and `#y-axis-canvas`) and in `audio-tool.html` for wave/spectrogram displays.

## Configuration

**Environment:**
- Completely serverless/static. No server configuration or environment variables required.

**Build:**
- None.

## Platform Requirements

**Development:**
- Any environment capable of editing HTML/CSS/JS and opening them in a modern web browser.

**Production:**
- Any static hosting provider (e.g. GitHub Pages, Vercel, Netlify, or local static files).

---

*Stack analysis: 2026-06-10*
*Update after major dependency changes*
