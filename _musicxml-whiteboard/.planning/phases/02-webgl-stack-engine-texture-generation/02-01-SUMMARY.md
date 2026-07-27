---
phase: webgl-stack-engine-texture-generation
plan: "01"
subsystem: capture
tags: [html2canvas, javascript, texture-clamping, offscreen-render]

requires: [gui-integration-data-bridge]
provides:
  - Offscreen staging container #offscreen-render-area
  - Track slice capturing and compositing engine (html2canvas)
  - Texture clamping and downscaling algorithm to <= 4096px width
  - Preview panel displaying captured track texture canvases
affects: [webgl-stack-engine]

tech-stack:
  added: [html2canvas library via CDN]
  patterns: [offscreen DOM capture, canvas downscaling]

key-files:
  created: []
  modified: [view3d.html, js/view3d.js]

key-decisions:
  - "Constructed offscreen staging elements dynamically using local dimensions, replicating editor drawings and notations to capture crop-aligned track planes."
  - "Limited output texture canvas width to a maximum of 4096px and downscaled proportionally to prevent GPU out-of-memory errors on large compositions."
  - "Used direct drawing of timeline background canvas slices to bake grid second division lines and labels into the final track texture."

patterns-established:
  - "Sequential offscreen capturing of multitrack layers to avoid concurrency issues during DOM layout drawing."
  - "Visual feedback previewing captured texture canvases in a panel before starting the 3D visualizer."

requirements-completed: [SCENE-03]

duration: 15min
completed: 2026-06-10
---

# Phase 2: WebGL Stack Engine & Texture Generation Plan 01 Summary

**Composed offscreen track snapshot capture and texture clamping/downscaling engine**

## Performance

- **Duration:** 15 min
- **Started:** 2026-06-10T17:28:00Z
- **Completed:** 2026-06-10T17:29:30Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added html2canvas library CDN reference to view3d.html.
- Created offscreen staging container `#offscreen-render-area` and preview dashboard container `#preview-panel` in view3d.html.
- Implemented `captureTrackTexture(track, parentWindow)` in js/view3d.js, performing sequential cloning of HTML/SVG track layers, slicing parent timeline canvas, and running html2canvas with a 150ms repaint delay.
- Added texture clamping logic limiting generated track canvases to a maximum width of 4096px with proportional height downscaling.
- Updated `loadDemoState` to generate high-resolution mock track textures (colored shapes, sine wave drawings, grid ticks, and titles) for local debugging.

## Task Commits

1. **Task 1: Add offscreen container to view3d.html** - Done during this phase.
2. **Task 2: Build offscreen canvas capture engine in js/view3d.js** - Done during this phase.

## Files Created/Modified
- `view3d.html` - Added html2canvas, preview panel, and offscreen staging container.
- `js/view3d.js` - Added captureTrackTexture, captureAllTracks, and mock texture generators.

## Decisions Made
- Chose to draw a slice of the parent's `#timeline-canvas` to back the track elements offscreen. This allows baking grid lines and time labels directly into the textures, avoiding complex 3D text rendering.
- Used sequential capturing of tracks (one-by-one) instead of parallel captures to avoid layout calculation freezes in the browser thread.

## Next Plan Readiness
- Offscreen texture capture and clamping are fully operational.
- Ready to bootstrap the Three.js WebGL scene and render the textures onto parallel stacked planes (Plan 2).
