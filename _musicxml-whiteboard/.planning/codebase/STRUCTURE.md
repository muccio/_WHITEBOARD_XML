# Directory Structure

This document outlines the file layout and structure of the MusicXML Whiteboard project.

## Top-Level Layout
```
/
├── css/             # Styling logic and layout rules
├── esempi/          # Sample JSON project files and XML scores
├── js/              # Application logic separated into modular scripts
├── index.html       # The primary whiteboard workspace
├── audio-tool.html  # Secondary utility for Web Audio FFT analysis
├── view3d.html      # 3D layered stacking visualizer utility
├── manuale.html     # User documentation and guide
└── GEMINI.md        # AI rules and project context
```

## JavaScript Structure (`js/`)
The JS files are divided into specific domains. Since they lack module import statements (`import/export`), they rely on being included in the correct order inside the main `index.html` file to properly populate the global window context.

- `js/globals.js`: Declares all shared global variables (`tracks`, `actionHistory`, `activeTrackId`, `selectedElement`, coordinate constants, zoom scaling).
- `js/main.js`: The application entry point. Initializes listeners on `window.onload`, configures viewports, and handles global keyboard shortcuts (undo/redo, copy/paste).
- `js/ui.js`: Manages standard user interface manipulations, timeline rendering on the `#timeline-canvas`, and vertical track axes on the `#y-axis-canvas`.
- `js/musicxml.js`: Contains all parsing and initialization logic for OpenSheetMusicDisplay to manage XML score loading.
- `js/svg-engine.js`: Handles all interactions within the `<svg id="draw-svg">`, including drawing shapes, Bezier manipulation, moving, resizing, and the real-time "mirroring" geometry function.
- `js/project.js`: Implements functionality for the top menu bar (File I/O). Responsible for compiling PDFs, saving JSON representations, and reloading projects.
- `js/history.js`: Contains functions that push states onto the `actionHistory` stack and functions to restore state backwards/forwards for undo/redo capabilities.
- `js/view3d.js`: Dedicated 3D engine logic for `view3d.html` to handle superimposed 3D track visualisations.

## CSS Structure (`css/`)
- `css/style.css`: The primary, monolithic CSS file containing all style rules. Contains global resets, floating panel layouts, absolute positioning rules for tracks, `z-index` management between SVG and HTML layers, and custom tool button styling.
