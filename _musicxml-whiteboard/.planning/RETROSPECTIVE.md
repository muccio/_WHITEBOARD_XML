# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-07-18
**Phases:** 3 | **Plans:** 4 | **Sessions:** ~6

### What Was Built
- GUI integration with a 3D visualizer popup button and window opener data synchronization bridge.
- Offscreen track snapshot capture and texture clamping/downscaling engine.
- Three.js rendering engine and 3D parallel multitrack stacked planes.
- Interactive floating controls HUD with real-time sliders and smooth camera presets.

### What Worked
- **Data Sharing via window.opener**: Avoided heavy serialization or local storage limits (which can crash with large SVG track data).
- **Offscreen html2canvas**: Safely rendered complex MusicXML elements to 2D textures for WebGL without freezing the main UI.

### What Was Inefficient
- Requirement tracking was somewhat manual, requiring gap analysis at the end (e.g., SYNC-01/02 and ISOL-01 were completed conceptually but not manually checked off).

### Patterns Established
- Use static `.js` and `.html` file inclusions instead of build processes to maintain the no-build static environment.
- Use OrbitControls for natural camera navigation in 3D WebGL scenes.
- Rely on global states (`window.opener.tracks` and `js/globals.js`) for cross-module integration.

### Key Lessons
1. When generating WebGL textures from DOM elements, it's critical to clamp maximum texture sizes down (e.g. 2048px or 4096px) to avoid hitting hardware texture limits on various GPUs.
2. Real-time synchronisation for complex Canvas rendering requires heavy optimizations (deferred to v2.0).

### Cost Observations
- Model mix: 100% Gemini Pro
- Notable: Efficient 4-plan execution spanning 3 phases.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~6 | 3 | Adopted full GSD workflow methodology |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 0 | N/A | html2canvas, Three.js, jsPDF |

### Top Lessons (Verified Across Milestones)

1. Avoid build tools for strictly client-side tools if the logic can be sandboxed into multiple scripts.
