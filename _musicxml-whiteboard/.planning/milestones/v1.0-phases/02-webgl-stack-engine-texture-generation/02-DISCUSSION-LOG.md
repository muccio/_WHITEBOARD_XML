# Phase 2: WebGL Stack Engine & Texture Generation - Discussion Log

**Date:** 2026-06-10

## Participants
- **User** (Visionary)
- **Antigravity** (Builder / AI Assistant)

## Selected Discussion Areas
All four identified gray areas were selected for detailed review and decided:

1. **Texture Scaling & Performance**
2. **Plane Styling & Transparency**
3. **Camera Initial Position**
4. **Timeline Ticks in 3D**

---

## Discussion Details

### 1. Texture Scaling & Performance
- **User Decision:** **Clamped Downscaling**.
- **Rationale:** Timelines can span thousands of pixels. Limiting the texture canvas width to a maximum of `4096px` (and downscaling if exceeded) protects against GPU out-of-memory crashes on low-spec or mobile devices while maintaining visual quality.

### 2. Plane Styling & Transparency
- **User Decision:** **Semi-Transparent with Double-Sided Rendering & Outlines**.
- **Rationale:** Double-sided rendering prevents planes from vanishing when rotated underneath. Semi-transparency (`0.7` opacity) lets users correlate vertical components. Outlines highlight individual layer boundaries clearly.

### 3. Camera Initial Position
- **User Decision:** **Tilted Isometric Perspective**.
- **Rationale:** Starting at a tilted angle (above, in front, and offset to the side) immediately communicates the 3D layered structure on startup, making the visualizer feel premium and dynamic from the first load.

### 4. Timeline Ticks in 3D
- **User Decision:** **Bake timelines into plane textures**.
- **Rationale:** The editor already draws timeline grid sections and tick canvas marks above track baselines in the DOM. Capturing these inline guarantees perfect alignment and avoids complex mathematical grid projections inside WebGL.

---

*Phase: 02-webgl-stack-engine-texture-generation*
*Discussion Log completed: 2026-06-10*
