# Coding Conventions

**Analysis Date:** 2026-06-10

## Naming Patterns

**Files:**
- kebab-case for script extensions and assets (e.g., `svg-engine.js`, `audio-tool.html`).

**Functions:**
- camelCase for all function names (e.g., `addTrack`, `saveHistoryState`, `makeDraggable`).
- Event handlers: `onEventName` pattern (e.g. `onPointerMove`, `onPointerUp`).

**Variables:**
- camelCase for local and global variables (e.g. `drawSvg`, `activeTrackId`, `selectedElement`).
- UPPER_SNAKE_CASE for structural constants (e.g., `GRID_SIZE`, `MAX_HISTORY`, `WORKSPACE_CENTER_Y`).

**DOM Selectors:**
- ID naming follows kebab-case (e.g. `proj-title`, `btn-undo`, `workspace-wrapper`).
- Class naming uses kebab-case (e.g. `controls-panel`, `measure-box`, `bezier-control-point`).

## Code Style

**Formatting:**
- **Indentation:** 4-space indentation for logic.
- **Semicolons:** Required for statement termination.
- **Quotes:** Double quotes preferred for strings in HTML markup, single/double quotes allowed in JS code.
- **Line Length:** Kept under 120 characters where possible, inline callbacks compressed.

**Linting:**
- No automated linting tool configured. Developers must maintain alignment by inspecting surrounding script blocks.

## Import & Load Organization

**Order of Loading (in `index.html`):**
Scripts are loaded in sequence at the footer of the body. Since the code relies on global namespaces, the loading order is strict:
1. `js/globals.js` - Mounts global state.
2. `js/history.js` - Undo/Redo stack handlers.
3. `js/ui.js` - Workspace canvas scaling and track UI layouts.
4. `js/svg-engine.js` - Vector drawing capabilities.
5. `js/musicxml.js` - OSMD parsers and score layout.
6. `js/project.js` - Serialization templates and PDF compilation.
7. `js/main.js` - Entry point bootstrapping event listeners.

## Error Handling

**Patterns:**
- **Local try/catch blocks:** Mandatory around file parsing (`JSON.parse` and `osmd.load`) and image/PDF capture cycles.
- **Graceful degradation:** Alert popups warn users about file corruption or permission blocks, preserving the current canvas drawing state.

## Logging

- **Console Outputs:** `console.log`, `console.warn`, and `console.error` are utilized to document asset loaders, missing layers, or viewport offsets during runtime debugging.
- No remote telemetry framework is attached.

## Comments

**Guidelines:**
- Use header blocks to demarcate files (`/* js/globals.js */`).
- Keep code clean: write simple comments describing math conversions, coordinate scales, and pointer capture boundaries.
- Keep comments in Italian or English depending on context; the existing codebase has comments mostly in Italian (e.g. `// GESTIONE TRACCE`, `// SISTEMA MULTI-TRACCIA & LAYERS`). Match this language style when modifying surrounding components.

## Function Design

- **Early Return:** Functions employ early exit guard clauses (`if (!btn) return;`) to reduce nested block depth.
- **Scope Isolation:** Avoid accessing window scopes dynamically; instead, reference the initialized global context variables declared in `js/globals.js`.

---

*Convention analysis: 2026-06-10*
*Update when patterns change*
