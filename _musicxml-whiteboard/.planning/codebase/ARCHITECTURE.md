# Architecture

**Analysis Date:** 2026-06-10

## Pattern Overview

**Overall:** Monolithic Event-Driven Single-Page Client Application.

**Key Characteristics:**
- **Shared Memory State:** Uses global variables in `js/globals.js` to coordinate track data, selected elements, tool parameters, history, and zoom.
- **Visual Grid/Time mapping:** Maps the horizontal X axis linearly to absolute timeline positions in seconds, with vertical tracks positioned sequentially down the Y axis.
- **Double Rendering Layer:** Combines SVG overlay (`#draw-svg` for vector artwork, curves, shapes) and HTML layers (`#patch-gallery` for layout, text inputs, and imported MusicXML note boxes).
- **No-Build Architecture:** Raw client execution without build bundles, loaders, or server compilers.

## Layers

**UI / Interface Layer:**
- Purpose: Provides user control panels, tools selection, document settings, and floating panels.
- Location: `index.html` (DOM Structure) and `js/main.js` / `js/ui.js` (listeners and modal controls).
- Used by: User interaction.

**Notation Engine:**
- Purpose: Integrates OpenSheetMusicDisplay to parse sheet music XML and generate modular measure blocks.
- Location: `js/musicxml.js`.
- Depends on: OpenSheetMusicDisplay library.
- Used by: Track HTML layer container to store `.measure-box` components.

**Graphics & Vector Drawing Layer:**
- Purpose: Handles interactive shape creations, Bezier path computations, control point binding, dragging, resizing, and mirroring.
- Location: `js/svg-engine.js` (for SVG drawings) and `js/ui.js` (for timeline/Y-axis canvas drawing).
- Used by: UI workspace user gestures.

**State & History Layer:**
- Purpose: Tracks the application undo/redo stack, handles track switching, updates track geometries, and maintains persistent state structure.
- Location: `js/globals.js` and `js/history.js`.
- Used by: All editing actions to guarantee regression safety.

**Project & Serialization Layer:**
- Purpose: Handles compiling the multi-layered visual canvas to PDF using `html2canvas` / `jsPDF`, and serializing project workspace states to JSON.
- Location: `js/project.js`.
- Used by: Save and Export buttons in the UI panel.

## Data Flow

### 1. Vector Path Creation
1. User selects a tool (e.g. `bezier` / `freehand`) in the dropdown.
2. SVG workspace listener in `js/svg-engine.js` registers `pointerdown`.
3. Coordinates are calculated using `getCanvasPos()` and adjusted for zoom and snapping grid.
4. An SVG element (`path`, `line`, `rect`, `circle`) is initialized and appended to the active track group inside `drawSvg`.
5. Moving and lifting the pointer updates the element geometry, saves the result, and calls `saveHistoryState()`.

### 2. MusicXML Import & Grid Layout
1. User loads a MusicXML file.
2. `js/musicxml.js` listener uses OSMD to load the data.
3. OSMD loops through each sheet music measure in a hidden container (`#render-temp`).
4. For each measure, the SVG markup is cloned, wrapped in a draggable `.measure-box` div, positioned horizontally on the grid, and added to the active track's HTML layer.
5. `makeDraggable()` attaches pointer events to handle dragging/snapping.
6. Updates history step.

### 3. PDF Compilation & Intelligent Cropping
1. User clicks the PDF Export button (`js/project.js` -> `exportToPDF()`).
2. Page zoom resets to 1:1, UI overlays are hidden via CSS class `.pdf-export-mode`.
3. Iterates over active and inactive tracks, evaluating bounding boxes via `getBBox()` (for SVG vector drawings) and `offsetTop`/`offsetHeight` (for HTML measure boxes) to find the minimum and maximum occupied Y positions.
4. Generates two canvas snapshots using `html2canvas` for `#y-axis-canvas` and `#workspace` matching the cropped content area height.
5. Composites the two images onto a unified document canvas, converts to a JPEG Data URL, and downloads as a PDF page using `jsPDF`.
6. Restores the interface to active edit mode.

## Key Abstractions

**Track Object:**
- Description: Represents an audio or instrumental sequence layout.
- Implementation: Stored inside the global `tracks` array. Properties include:
  - `id`: unique track string key.
  - `name`: user display label.
  - `baseY`: absolute vertical baseline offset.
  - `offsetY`: dynamic spacing distance from anchor.
  - `yLabels`: custom array of axis section labels.
  - `svgContent` & `htmlContent`: serialized string layouts.

**Measure Box:**
- Description: A draggable DOM element containing notation graphics.
- Implementation: Class `.measure-box` in the HTML track layer.

**History Entry:**
- Description: Snapshot of the entire track state.
- Implementation: Stored in `actionHistory` as deep-cloned JSON arrays of `tracks`.

## Entry Points

**Main Init Handler:**
- Location: `js/main.js` (listener `window.onload`).
- Responsibilities: Triggers track initialization (`initTracks()`), configures document scroll centering, maps shortcuts (copy/paste/undo/redo), and mounts command event handlers.

## Error Handling

- **Try/Catch Blocks:** Wrapped around external file imports (JSON project parse, MusicXML parsing, and PDF rendering).
- **User Alerts:** Catches exceptions and issues modal `alert()` indicators when loaded files are corrupted or malformed.

## Cross-Cutting Concerns

**Grid Snapping:**
- Coordinates are snapped to `GRID_SIZE` (20px) increments when `snap-grid` checkbox is enabled, affecting both SVG path creation, point dragging, and HTML measure boxes.

**Symmetric Drawing (Mirror):**
- When drawing on the SVG canvas with `mirror-draw` checked, shape geometries are cloned in real-time as an SVG `<use>` element mirrored over the active track's horizontal baseline.

---

*Architecture analysis: 2026-06-10*
*Update when major patterns change*
