# Codebase Structure

**Analysis Date:** 2026-06-10

## Directory Layout

```
_musicxml-whiteboard/
├── css/                  # Interface stylesheets
│   └── style.css        # Visual styles, themes, and layouts
├── esempi/               # Project templates and example files
│   ├── *.json            # Serialized whiteboard sketches
│   └── musicxml.xml      # Reference sheet music XML score
├── js/                   # Core application scripts
│   ├── globals.js       # Constants, global states, and namespace holders
│   ├── history.js       # Action logs and state restorers (Undo/Redo)
│   ├── main.js          # Startup script, copy/paste, and shortcut registers
│   ├── musicxml.js      # MusicXML parser, box layout, and drag controllers
│   ├── project.js       # Serializer and PDF canvas composer
│   ├── svg-engine.js    # Vector drawing tools, Bezier handlers, control points
│   └── ui.js            # Workspace sizing, track grids, panels, zoom
├── audio-tool.html       # Audio analyzer and FFT spectrogram utility
├── index.html            # Core application entry and canvas page
└── manuale.html          # Interactive user manual and guide
```

## Directory Purposes

**css/**
- Purpose: Stores styling sheets for the application.
- Contains: `style.css` (custom UI stylesheet).
- Key files: `style.css` - defines custom CSS variables, glassmorphism layouts, floating panels, collapsible panel states, and modal rules.

**esempi/**
- Purpose: Contains mock project saves and demonstration sheets.
- Contains: `.json` projects and `.xml` score samples.
- Key files: `test.json`, `musicxml.xml` (used for manual verification and onboarding).

**js/**
- Purpose: Houses the modular codebase logic divided by system concerns.
- Contains: `*.js` source files.
- Key files:
  - `globals.js` - definitions for core states.
  - `svg-engine.js` - interactive drawing and path alteration.
  - `ui.js` - workspace scaling and responsive spacing.
  - `project.js` - exports and prints.

## Key File Locations

**Entry Points:**
- `index.html`: Main canvas application entry.
- `audio-tool.html`: Utility audio analysis tool entry.
- `js/main.js`: Setup script executed when the window loads.

**Configuration:**
- CSS Custom Variables: Defined in `css/style.css` under `:root`.
- Snapping and spacing limits: Controlled via `js/globals.js`.

**Core Logic:**
- SVG Shapes and Control Points: `js/svg-engine.js`.
- Tracks and Spacing: `js/ui.js`.
- XML Notation parsing: `js/musicxml.js`.

**Documentation:**
- `manuale.html`: Integrated User manual linked in the Menu dashboard.

## Naming Conventions

**Files:**
- kebab-case for assets and pages (e.g. `audio-tool.html`, `svg-engine.js`).
- standard extensions (`.html`, `.css`, `.js`).

**Directories:**
- lowercase, singular or plural for groupings (e.g. `css`, `js`, `esempi`).

**Variable & Function Names:**
- camelCase for functions (`saveHistoryState`, `updateTrackPositions`).
- UPPER_SNAKE_CASE for constant values (`GRID_SIZE`, `WORKSPACE_CENTER_Y`).

## Where to Add New Code

**New Drawing Tool/Shape:**
- Option element in HTML dropdown: `index.html` (under `#draw-tool`).
- Event triggers and SVG shape creator logic: `js/svg-engine.js`.

**New Keyboard Shortcuts:**
- Command mapping: `js/main.js` (inside the `keydown` event listener).

**New Workspace Panel:**
- Panel HTML markup: `index.html` (using `.controls-panel` class).
- Floating panel activation and draggable hooks: `js/ui.js` (using `makePanelDraggable`).

**New Global State Variable:**
- Variable definition and initial values: `js/globals.js`.

---

*Structure analysis: 2026-06-10*
*Update when directory structure changes*
