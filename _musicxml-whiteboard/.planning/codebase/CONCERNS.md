# Codebase Concerns & Tech Debt

This document catalogs technical debt, security vectors, performance bottlenecks, and architectural limitations in the current implementation.

## Architecture & Code Quality
- **Global State Pollution**: The application depends entirely on shared global variables managed in `js/globals.js` (`tracks`, `actionHistory`, `activeTrackId`). This tight coupling creates a significant risk of state desynchronization, makes reasoning about component side-effects difficult, and prohibits modular isolation.
- **Lack of Module System**: Scripts are loaded procedurally via `<script>` tags in `index.html`. Variable scope leakages are a constant threat. Adopting ES6 Modules or an IIFE pattern would improve boundary safety.
- **Type Safety**: The codebase lacks JSDoc strings or TypeScript integration. As a complex state application parsing nested data structures from JSON and XML, lack of type validation at runtime significantly increases the likelihood of "undefined is not an object" exceptions.

## Performance Bottlenecks
- **DOM Churn**: Generating complex SVG paths and hundreds of individual DOM nodes for MusicXML measures can throttle the browser's painting cycle. Optimizing for `requestAnimationFrame` or culling off-screen elements is absent.
- **Main Thread Locking**: Exporting a complex PDF project using `html2canvas` is a heavy, synchronous operation that will lock the browser's main UI thread, resulting in freezes on large compositions.
- **3D Visualization Workloads**: `view3d.html` is tasked with rendering static 3D layers. Capturing and rendering high-resolution textures dynamically can quickly bloat memory usage and stutter rendering if WebGL contexts aren't carefully managed.

## Security & Reliability
- **Cross-Site Scripting (XSS)**: By ingesting raw MusicXML (`.xml`) and JSON files locally and parsing them to DOM elements, standard XSS vulnerabilities apply. While there is no backend risk, a maliciously crafted project file could execute arbitrary scripts on the client.
- **Fragile Undo/Redo**: The `js/history.js` system clones the entire state array on every action. For very large projects, this deep-cloning mechanism will create severe memory pressure (bloat) and potential browser OOM (Out of Memory) crashes, necessitating strict `MAX_HISTORY` limits.

## Accessibility (A11y)
- The application uses custom canvas and SVG interactions that cannot be easily read by screen readers. Keyboard navigation for dragging objects or traversing the timeline is non-existent.
