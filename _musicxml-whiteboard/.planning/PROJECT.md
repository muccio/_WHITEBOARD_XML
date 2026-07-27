# MusicXML Whiteboard Pro 3D

## What This Is

MusicXML Whiteboard Pro is a web-based client whiteboard application that enables composers to map and visualize contemporary musical form, combining traditional notation (MusicXML) with graphical drawings, symbols, and background track offsets. The project will extend this whiteboard with a static 3D layered stacked visualizer that displays tracks superimposed as parallel semi-transparent planes.

## Core Value

Enable users to visualize their multi-track compositions globally as stacked 3D layers in a separate window, aligning tracks chronologically to inspect vertical interactions.

## Current Milestone: v1.1 PWA & Offline Support

**Goal:** Turn the whiteboard into a Progressive Web App (PWA) that can be installed on devices and works fully offline.

**Target features:**
- Setup a Web App Manifest (`manifest.json`) for installation and home-screen presence.
- Implement a Service Worker to intercept requests and cache assets for offline access.
- Migrate all external CDN dependencies to local files.
- Add an "Install App" button/prompt and offline status indicators to the UI.

## Requirements

### Validated

- ✓ Multi-track canvas interface with dynamic horizontal timelines — existing
- ✓ Dynamic track spacing control — existing
- ✓ Custom Y-axis divisions with name editing — existing
- ✓ Zooming and pinch-to-zoom scrolling — existing
- ✓ Vector drawing engine (Freehand, line, circle, rect, text, image, eraser, fill, bezier curve) — existing
- ✓ Elements interaction (selecting, dragging, duplicating, resizing, deleting) — existing
- ✓ Real-time symmetric drawing (mirror) — existing
- ✓ MusicXML file import rendering as draggable measures — existing
- ✓ Undo and Redo editing history stack — existing
- ✓ Whiteboard layout serialization to JSON files — existing
- ✓ Content clipboard capabilities (Ctrl+C, Ctrl+V) — existing
- ✓ Canvas screenshot and crop compilation to PDF — existing
- ✓ Background trace layer overlay — existing
- ✓ Audio utility tool with waveform and FFT sonograms — existing

### Active

- [ ] Setup a Web App Manifest (`manifest.json`) for installation and home-screen presence.
- [ ] Implement a Service Worker to intercept requests and cache assets for offline access.
- [ ] Migrate all external CDN dependencies to local files.
- [ ] Add an "Install App" button/prompt and offline status indicators to the UI.

### Validated (v1.0 MVP)

- ✓ Render a new 3D view in a separate browser tab or window — v1.0
- ✓ Superimpose whiteboard tracks on stacked parallel 3D planes using WebGL (Three.js) — v1.0
- ✓ Align track X-axis timelines precisely in 3D space — v1.0
- ✓ Implement UI controls in the 3D view for global camera rotation/zoom and individual track transparency — v1.0
- ✓ Read parent session state dynamically via `window.opener` without local storage limitations — v1.0
- ✓ Write 3D code in a separate HTML/JS file to minimize impact on the editor's existing codebase — v1.0

### Out of Scope

- Direct whiteboard modifications or editing from within the 3D view window (read-only view)
- Volumetric 3D mesh representations of musical symbols/notes (planar textures are sufficient)
- Multi-client real-time synchronization servers

## Context

The current application is a completely static, frontend-only project (no package manager or build pipeline). External dependencies are imported via CDNs. The 3D layered stacked visualization needs to be similarly lightweight, using WebGL (Three.js with OrbitControls) to stack planes.

To render the tracks faithfully as textured planes, we can draw the contents of each track (SVG elements and DOM-based measure boxes) onto temporary Canvas layers or convert them to images before mapping them as WebGL textures. 

Passing data via `window.opener.tracks` resolves sandboxing and size restrictions for local `file://` usage.

## Constraints

- **Tech Stack**: Frontend-only static files (HTML/JS) without compiling or bundling, using standard browser APIs and CDN libraries.
- **Compatibility**: Must work locally via `file://` protocol or static page hosting.
- **Performance**: High-resolution textures must be generated quickly without locking the browser's UI thread.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use Three.js WebGL via CDN | Allows orbit rotation, camera pan/zoom, and semi-transparent stacked layouts. | ✓ Good |
| Pass data via `window.opener` | Simplifies state sharing for local file usage, avoiding localStorage quota limits. | ✓ Good |
| Stacked textured planes | Rendering drawings and notation onto 2D planes stacked in 3D preserves exact visuals. | ✓ Good |
| Use html2canvas offscreen | Required for accurate SVG/DOM capture without blocking main thread. | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-18 after starting v1.1 milestone*
