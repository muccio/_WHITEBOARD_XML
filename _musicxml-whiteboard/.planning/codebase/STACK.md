# Technology Stack

This document outlines the core technology stack for the MusicXML Whiteboard Pro 3D project.

## Languages
- **JavaScript (ES6+)**: Used for application logic. The code is modularized into files inside the `js/` directory (e.g., `globals.js`, `history.js`, `main.js`, `musicxml.js`, `project.js`, `svg-engine.js`, `ui.js`, `view3d.js`).
- **HTML5**: Page structures, primarily in `index.html`, `audio-tool.html`, `view3d.html`, and `manuale.html`.
- **CSS3**: Visual styles, contained mainly in `css/style.css` and some inline styles.

## Runtime Environment
- **Client-side Web Browser**: The application relies entirely on modern browser features.
- **Required APIs**:
  - Canvas API (rendering timeline, wave, and spectrogram displays)
  - Web Audio API (FFT calculation, real-time/static audio features in `audio-tool.html`)
  - SVG DOM API (vector artwork, bezier curves, drawing elements)
  - Pointer Events API (managing drag/drop and interactions)
- **Backend Runtime**: None. The project operates locally via the `file://` protocol or standard static hosting.

## Frameworks
- **None**: Built entirely with Vanilla JavaScript and standard browser DOM APIs.

## Key Dependencies
These external libraries are loaded directly via CDNs in the HTML files:
- **OpenSheetMusicDisplay v1.6.1** (`opensheetmusicdisplay.min.js`): Parses and renders MusicXML files into modular vector SVGs on the workspace canvas.
- **html2canvas v1.4.1** (`html2canvas.min.js`): Dynamically captures DOM and Canvas element screenshots, primarily for PDF generation.
- **jsPDF v2.5.1** (`jspdf.umd.min.js`): Compiles the screen captures and vectors into multi-track printable documents.

## Configuration & Deployment
- Completely static and serverless.
- No package.json, npm scripts, or build systems.
- Compatible with any static hosting provider (e.g., GitHub Pages, Netlify, Vercel).
