<!-- GSD:project-start source:PROJECT.md -->
## Project

**MusicXML Whiteboard Pro 3D**

MusicXML Whiteboard Pro is a web-based client whiteboard application that enables composers to map and visualize contemporary musical form, combining traditional notation (MusicXML) with graphical drawings, symbols, and background track offsets. The project will extend this whiteboard with a static 3D layered stacked visualizer that displays tracks superimposed as parallel semi-transparent planes.

**Core Value:** Enable users to visualize their multi-track compositions globally as stacked 3D layers in a separate window, aligning tracks chronologically to inspect vertical interactions.

### Constraints

- **Tech Stack**: Frontend-only static files (HTML/JS) without compiling or bundling, using standard browser APIs and CDN libraries.
- **Compatibility**: Must work locally via `file://` protocol or static page hosting.
- **Performance**: High-resolution textures must be generated quickly without locking the browser's UI thread.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- JavaScript (ES6+) - Application logic in `js/` directory (`globals.js`, `history.js`, `main.js`, `musicxml.js`, `project.js`, `svg-engine.js`, and inline script in `audio-tool.html`).
- HTML5 - Page structures in `index.html`, `audio-tool.html`, and `manuale.html`.
- CSS3 - Visual styles in `css/style.css` and inline page rules.
- None.
## Runtime
- Client-side Web Browser (requires Canvas API, Web Audio API, SVG DOM API, Pointer Events API).
- No backend runtime or local compilation/bundling.
- None (external libraries are loaded via CDNs).
- Lockfile: None.
## Frameworks
- None (Vanilla JavaScript).
- None.
- None.
## Key Dependencies
- OpenSheetMusicDisplay v1.6.1 (CDN: `https://cdn.jsdelivr.net/npm/opensheetmusicdisplay@1.6.1/build/opensheetmusicdisplay.min.js`) - Renders MusicXML files to vector SVGs on the workspace canvas.
- html2canvas v1.4.1 (CDN: `https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js`) - Dynamically captures DOM and Canvas element screenshots for PDF rendering.
- jsPDF v2.5.1 (CDN: `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`) - Compiles screen captures into multi-track printable documents.
- Browser Web Audio API - Used in `audio-tool.html` to load files, perform Cooley-Tukey Radix-2 FFT calculation, and display real-time/static audio features.
- Browser SVG API - Used in `js/svg-engine.js` to draw vector elements, lines, circles, text, and Bezier curves.
- Browser Canvas API - Used in `js/ui.js` for timeline rendering (`#timeline-canvas` and `#y-axis-canvas`) and in `audio-tool.html` for wave/spectrogram displays.
## Configuration
- Completely serverless/static. No server configuration or environment variables required.
- None.
## Platform Requirements
- Any environment capable of editing HTML/CSS/JS and opening them in a modern web browser.
- Any static hosting provider (e.g. GitHub Pages, Vercel, Netlify, or local static files).
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- kebab-case for script extensions and assets (e.g., `svg-engine.js`, `audio-tool.html`).
- camelCase for all function names (e.g., `addTrack`, `saveHistoryState`, `makeDraggable`).
- Event handlers: `onEventName` pattern (e.g. `onPointerMove`, `onPointerUp`).
- camelCase for local and global variables (e.g. `drawSvg`, `activeTrackId`, `selectedElement`).
- UPPER_SNAKE_CASE for structural constants (e.g., `GRID_SIZE`, `MAX_HISTORY`, `WORKSPACE_CENTER_Y`).
- ID naming follows kebab-case (e.g. `proj-title`, `btn-undo`, `workspace-wrapper`).
- Class naming uses kebab-case (e.g. `controls-panel`, `measure-box`, `bezier-control-point`).
## Code Style
- **Indentation:** 4-space indentation for logic.
- **Semicolons:** Required for statement termination.
- **Quotes:** Double quotes preferred for strings in HTML markup, single/double quotes allowed in JS code.
- **Line Length:** Kept under 120 characters where possible, inline callbacks compressed.
- No automated linting tool configured. Developers must maintain alignment by inspecting surrounding script blocks.
## Import & Load Organization
## Error Handling
- **Local try/catch blocks:** Mandatory around file parsing (`JSON.parse` and `osmd.load`) and image/PDF capture cycles.
- **Graceful degradation:** Alert popups warn users about file corruption or permission blocks, preserving the current canvas drawing state.
## Logging
- **Console Outputs:** `console.log`, `console.warn`, and `console.error` are utilized to document asset loaders, missing layers, or viewport offsets during runtime debugging.
- No remote telemetry framework is attached.
## Comments
- Use header blocks to demarcate files (`/* js/globals.js */`).
- Keep code clean: write simple comments describing math conversions, coordinate scales, and pointer capture boundaries.
- Keep comments in Italian or English depending on context; the existing codebase has comments mostly in Italian (e.g. `// GESTIONE TRACCE`, `// SISTEMA MULTI-TRACCIA & LAYERS`). Match this language style when modifying surrounding components.
## Function Design
- **Early Return:** Functions employ early exit guard clauses (`if (!btn) return;`) to reduce nested block depth.
- **Scope Isolation:** Avoid accessing window scopes dynamically; instead, reference the initialized global context variables declared in `js/globals.js`.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- **Shared Memory State:** Uses global variables in `js/globals.js` to coordinate track data, selected elements, tool parameters, history, and zoom.
- **Visual Grid/Time mapping:** Maps the horizontal X axis linearly to absolute timeline positions in seconds, with vertical tracks positioned sequentially down the Y axis.
- **Double Rendering Layer:** Combines SVG overlay (`#draw-svg` for vector artwork, curves, shapes) and HTML layers (`#patch-gallery` for layout, text inputs, and imported MusicXML note boxes).
- **No-Build Architecture:** Raw client execution without build bundles, loaders, or server compilers.
## Layers
- Purpose: Provides user control panels, tools selection, document settings, and floating panels.
- Location: `index.html` (DOM Structure) and `js/main.js` / `js/ui.js` (listeners and modal controls).
- Used by: User interaction.
- Purpose: Integrates OpenSheetMusicDisplay to parse sheet music XML and generate modular measure blocks.
- Location: `js/musicxml.js`.
- Depends on: OpenSheetMusicDisplay library.
- Used by: Track HTML layer container to store `.measure-box` components.
- Purpose: Handles interactive shape creations, Bezier path computations, control point binding, dragging, resizing, and mirroring.
- Location: `js/svg-engine.js` (for SVG drawings) and `js/ui.js` (for timeline/Y-axis canvas drawing).
- Used by: UI workspace user gestures.
- Purpose: Tracks the application undo/redo stack, handles track switching, updates track geometries, and maintains persistent state structure.
- Location: `js/globals.js` and `js/history.js`.
- Used by: All editing actions to guarantee regression safety.
- Purpose: Handles compiling the multi-layered visual canvas to PDF using `html2canvas` / `jsPDF`, and serializing project workspace states to JSON.
- Location: `js/project.js`.
- Used by: Save and Export buttons in the UI panel.
## Data Flow
### 1. Vector Path Creation
### 2. MusicXML Import & Grid Layout
### 3. PDF Compilation & Intelligent Cropping
## Key Abstractions
- Description: Represents an audio or instrumental sequence layout.
- Implementation: Stored inside the global `tracks` array. Properties include:
- Description: A draggable DOM element containing notation graphics.
- Implementation: Class `.measure-box` in the HTML track layer.
- Description: Snapshot of the entire track state.
- Implementation: Stored in `actionHistory` as deep-cloned JSON arrays of `tracks`.
## Entry Points
- Location: `js/main.js` (listener `window.onload`).
- Responsibilities: Triggers track initialization (`initTracks()`), configures document scroll centering, maps shortcuts (copy/paste/undo/redo), and mounts command event handlers.
## Error Handling
- **Try/Catch Blocks:** Wrapped around external file imports (JSON project parse, MusicXML parsing, and PDF rendering).
- **User Alerts:** Catches exceptions and issues modal `alert()` indicators when loaded files are corrupted or malformed.
## Cross-Cutting Concerns
- Coordinates are snapped to `GRID_SIZE` (20px) increments when `snap-grid` checkbox is enabled, affecting both SVG path creation, point dragging, and HTML measure boxes.
- When drawing on the SVG canvas with `mirror-draw` checked, shape geometries are cloned in real-time as an SVG `<use>` element mirrored over the active track's horizontal baseline.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.agent/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
