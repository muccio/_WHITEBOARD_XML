# Phase 2: WebGL Stack Engine & Texture Generation - Context

**Gathered:** 2026-06-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up the WebGL rendering engine using Three.js inside the child popup window. This includes offscreen rendering and capturing track DOM segments via html2canvas, mapping those snapshots as dynamic textures onto transparent 3D planes, and stacking the planes vertically with active OrbitControls navigation.

</domain>

<decisions>
## Implementation Decisions

### Texture Scaling & Performance
- **D-01:** Capture track textures using `html2canvas` at 1x scale. Clamp the maximum width of the texture canvas to `4096px` to prevent GPU out-of-memory errors on large timelines. If a track's width exceeds 4096px, downscale the texture proportionally.

### Plane Styling & Rendering
- **D-02:** Configure the track planes with an initial opacity of `0.7` to allow vertical alignment checking across layers.
- **D-03:** Enable double-sided rendering (`side: THREE.DoubleSide`) so planes remain visible when the camera orbits underneath.
- **D-04:** Render a thin, semi-transparent colored outline/border around each plane to visually demarcate track boundaries.

### Camera Perspective & Default View
- **D-05:** Set the initial camera position to a tilted **Isometric Perspective** (offset above, in front, and to the side) to showcase the vertical 3D depth stack immediately upon loading.

### Timeline Integration
- **D-06:** Bake timeline division marks and second labels directly into the track textures by capturing the track DOM containers with their timeline grids visible. This avoids complex 3D coordinate mapping.

### the agent's Discretion
- Centering, camera Field of View (FOV), and near/far plane settings.
- Exact styling details of the plane borders (e.g., color, thickness).
- The duration of the offscreen capture wait delay (e.g. ~100-200ms) to ensure SVG drawings and notation boxes are painted before the screenshot is taken.

</decisions>

<canonical_refs>
## Canonical References

### Requirements & Roadmap
- [.planning/REQUIREMENTS.md](file:///Users/mariosalvucci/Documents/Development/WEBDEV/_WHITEBOARD_XML/_musicxml-whiteboard/.planning/REQUIREMENTS.md) §v1 Requirements: 3D WebGL Scene (SCENE-01, SCENE-02, SCENE-03, CTRL-01)
- [.planning/ROADMAP.md](file:///Users/mariosalvucci/Documents/Development/WEBDEV/_WHITEBOARD_XML/_musicxml-whiteboard/.planning/ROADMAP.md) §Phase 2 details

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `js/project.js` `html2canvas` capture block: We can copy the configuration parameters and offscreen capturing logic used during PDF creation to extract track snapshots.

### Established Patterns
- Loading external libraries via CDN script tags in HTML head (as done in `index.html`).

### Integration Points
- `view3d.html`: Add CDNs for Three.js (`three.min.js`) and OrbitControls (`OrbitControls.js`).
- `js/view3d.js`: Integrate the Three.js setup, scene initialization, plane drawing, and OrbitControls loop.

</code_context>

<deferred>
## Deferred Ideas

- **CTRL-02, CTRL-03, CTRL-04 (HUD Controls)**: Floating opacity/spacing sliders and camera preset buttons are deferred to Phase 3.

</deferred>

---

*Phase: 02-webgl-stack-engine-texture-generation*
*Context gathered: 2026-06-10*
