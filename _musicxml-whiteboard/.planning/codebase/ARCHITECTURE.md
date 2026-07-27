# Architecture

This document maps out the system design, patterns, and logic layers of the application.

## Pattern Overview
- **Shared Memory State**: Because there is no modular bundler or state container like Redux, state is managed through a central pool of global variables inside `js/globals.js`. Components mutate these variables directly.
- **Visual Grid/Time Mapping**: The horizontal X-axis maps linearly to absolute timeline positions in seconds. Tracks are distributed vertically down the Y-axis.
- **Double Rendering Layer**: The visual canvas is divided into:
  - An SVG Overlay (`#draw-svg`) for user-created vector artwork, curves, shapes, and markings.
  - An HTML Overlay (`#patch-gallery`) for rigid elements like text inputs and imported MusicXML note boxes (`.measure-box`).
- **No-Build Architecture**: Files are executed as raw scripts by the browser. There are no transpilers (Babel/TypeScript) or bundlers (Webpack/Vite).

## Logic Layers

### 1. UI & Presentation
- **Files**: `index.html`, `js/main.js`, `js/ui.js`
- **Responsibility**: Manages the main workspace viewport, floating tool panels, modal controls, panning, zooming, and canvas drawing axes.

### 2. Notation Engine
- **Files**: `js/musicxml.js`
- **Responsibility**: Integrates `OpenSheetMusicDisplay` to parse and render `.xml`/`.musicxml` files. Extracted measures are packaged into HTML `.measure-box` nodes and placed onto tracks.

### 3. Drawing Engine (SVG)
- **Files**: `js/svg-engine.js`
- **Responsibility**: Manages interactive shape creation, Bezier path computations, control point binding, element dragging, and real-time mirroring.

### 4. State & History Management
- **Files**: `js/globals.js`, `js/history.js`
- **Responsibility**: Tracks the undo/redo stack (`actionHistory`), handles track geometry and references, and ensures regression safety during complex edits.

### 5. Data Export & Storage
- **Files**: `js/project.js`
- **Responsibility**: Serializes the `tracks` array into downloadable JSON objects. Coordinates the multi-layered DOM snapshotting required to compile printable multi-page PDFs using `html2canvas` and `jsPDF`.

## Data Flow
1. **Vector Path Creation**: Pointer events captured in `js/main.js` -> Coordinate math and SVG node injection by `js/svg-engine.js` -> Global state mutated in `js/globals.js` -> History snapshot appended by `js/history.js`.
2. **MusicXML Import**: File dropped in UI -> `js/musicxml.js` uses OSMD to parse sheet -> Measures added to HTML track layer -> State updated.
3. **PDF Compilation**: Save button triggered -> `js/project.js` temporarily resets viewports -> Takes canvas screenshots layer-by-layer -> Embeds into jsPDF -> Prompts user download.

## Key Abstractions
- **Track Definition**: Object representing an audio/instrumental sequence in the `tracks` array.
- **Measure Box**: Draggable DOM `div.measure-box` containing OSMD notation.
- **History Frame**: A deep-cloned JSON snapshot of the track state array stored in `actionHistory`.
