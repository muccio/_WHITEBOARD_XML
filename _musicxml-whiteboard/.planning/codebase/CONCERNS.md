# Codebase Concerns

**Analysis Date:** 2026-06-10

## Tech Debt

**Global Scope Pollution:**
- Issue: Almost all application state variables (e.g., `tracks`, `activeTrackId`, `currentZoom`, `selectedElement`) are declared in the global window namespace.
- Files: `js/globals.js` (declaration of variables) and referenced throughout all files.
- Impact: Highly vulnerable to variable collisions, makes unit testing extremely difficult, and complicates scaling.
- Fix approach: Refactor code into encapsulated ES6 modules, introducing a state manager class/store.

**Fragile Loading Order:**
- Issue: Script references at the bottom of `index.html` depend on global declarations loaded in a strict sequential order.
- Files: `index.html` (lines 150-156).
- Impact: A single reordering of tags or missing file load immediately breaks the entire application.
- Fix approach: Move to standard imports (`import`/`export`) and compile or bundle via a lightweight compiler if needed, or simply use `<script type="module">`.

**Direct DOM and String-based Updates:**
- Issue: Direct edits to DOM layouts (`innerHTML = ...`) are widely used to store, copy, and restore drawings.
- Files: `js/history.js` (lines 35-47), `js/project.js` (lines 179-180), `js/musicxml.js` (line 27).
- Impact: Prevents clean separation of concerns, complicates element tracking, and bypasses virtual layout efficiencies.
- Fix approach: Adopt a template system or lightweight data-binding architecture where DOM rendering is a side-effect of state variations.

## Known Bugs

**Drag and Translation Control Offset on Bezier Points:**
- Symptoms: Dragging shape handles or Bezier control points can become desynchronized from the actual cursor path.
- Trigger: Rapid dragging or moving points when the timeline scale zoom is not set to 100%.
- Files: `js/svg-engine.js` (lines 155-219, lines 360-393).
- Workaround: Reset zoom to 100% or reload the project.
- Root cause: Conversions between global client mouse coordinates, zoom-scaled canvas steps, and parent track translateY translations can introduce cumulative mathematical rounding issues.

## Security Considerations

**Cross-Site Scripting (XSS) via Project Import:**
- Risk: Project data from downloaded JSON files is imported and injected directly into the DOM using `innerHTML` without sanitization.
- Files: `js/project.js` (lines 230, 235) and `js/history.js` (lines 39, 45).
- Current mitigation: None (assumes trust of the loaded file).
- Recommendations: Sanitize all SVG and HTML strings using DOMPurify before setting `innerHTML`, or create DOM nodes programmatically.

## Performance Bottlenecks

**Wiping/Redrawing DOM on State Restore:**
- Problem: Activating Undo/Redo forces the browser to wipe the entire SVG and HTML track layers and rebuild them from raw strings.
- Measurement: Can block/lag the UI for 300ms+ on complex drawings with 150+ nodes.
- Files: `js/history.js` (lines 32-47).
- Cause: Lack of DOM diffing or incremental restoration.
- Improvement path: Implement element-level change logs or patch diffs instead of deep DOM rebuilding.

**Sequential Measure Render Loop:**
- Problem: Importing MusicXML forces OSMD to render each measure individually in a loop, pausing for 5ms per measure.
- Measurement: 100+ measures can freeze the main thread for several seconds.
- Files: `js/musicxml.js` (lines 43-93).
- Cause: Synchronous single-threaded layout rendering on a hidden DOM element.
- Improvement path: Perform rendering inside a Web Worker or display a loading overlay while importing.

## Fragile Areas

**Track Spacing Adjustments:**
- File: `js/ui.js` (lines 67-82).
- Why fragile: Modifying the distance between tracks shifts the visual position of absolute overlays (`y-axis-canvas` and HTML/SVG groups) dynamically.
- Common failures: Inactive layer positioning becomes misaligned if track parameters are edited in an unexpected sequence.
- Safe modification: Call `updateWorkspaceSize()` and `drawYAxis()` immediately after altering coordinates.

## Scaling Limits

**OOM Errors in high-resolution PDF Exports:**
- Current capacity: Up to 3-4 tracks of average length.
- Limit: Large compositions spanning 8+ tracks and 1000s of pixels high.
- Symptoms: Browser crash or blank pages during PDF download.
- Cause: `html2canvas` generating a massive high-DPI image buffer exceeding standard canvas memory limits.
- Scaling path: Export tracks as separate pages, or crop the workspace into multiple blocks.

## Missing Critical Features

**Notation Serialization (Export XML):**
- Problem: The application supports importing MusicXML files but cannot export the resulting changes back into a valid MusicXML file.
- Workaround: Users must save the project as a whiteboard JSON file.
- Implementation complexity: High (requires rebuilding XML nodes from the structured canvas state).

---

*Concerns audit: 2026-06-10*
*Update as issues are fixed or new ones discovered*
