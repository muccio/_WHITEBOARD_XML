# Phase 3: Interactive HUD Controls & View Presets - Context

**Gathered:** 2026-06-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Construct a floating overlay control panel HUD inside view3d.html. This HUD includes opacity and vertical spacing sliders and quick camera snap view preset buttons (Top, Side/Front-Profile, and Isometric). This phase covers strictly interactive visualizer controls; editing the whiteboard contents or timeline structure remains out of scope.

</domain>

<decisions>
## Implementation Decisions

### Preset Transitions
- **D-01:** Camera glides smoothly to preset target coordinates over a 400ms transition period (using linear or easing interpolation in the render loop) instead of jumping instantly, preventing user disorientation.

### HUD Layout & Position
- **D-02:** Style the control panel as a bottom-centered horizontal floating toolbar overlaying the WebGL canvas.
- **D-03:** Apply a modern glassmorphism aesthetic matching the editor theme:
  - Background: `rgba(40, 44, 52, 0.75)`
  - Backdrop filter blur: `15px`
  - Border: `1px solid rgba(255, 255, 255, 0.1)`
  - Border radius: `12px`
  - Floating shadow: `0 10px 30px rgba(0, 0, 0, 0.5)`

### Slider Interaction Mode
- **D-04:** Adjusting the opacity and spacing sliders shifts track plane properties in real time as the user drags them, providing immediate visual feedback.

### View Preset Angles
- **D-05:** Define the three preset angles:
  - **Top (2D)**: Tilted slightly (e.g. camera looking down with a very minor offset to avoid gimbal lock) to inspect the 2D layout.
  - **Side (Front Profile)**: Positioned directly along the Z-axis looking at the stack center, displaying timeline seconds left-to-right with track planes stacked vertically as horizontal lines.
  - **Isometric**: Resets the camera to the default tilted perspective.

### the agent's Discretion
- Easing function or interpolation method for smooth camera transitions.
- Exact spacing, icons, and labels inside the HUD toolbar.
- Slider handle and track custom styling details.

</decisions>

<specifics>
## Specific Ideas

- Camera transitions should feel like a smooth glissando glide.
- The HUD should automatically hide when the disconnected warning overlay is visible.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` §v1 Requirements: Interactive View Controls (CTRL-02, CTRL-03, CTRL-04)
- `.planning/ROADMAP.md` §Phase 3 details

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `css/style.css` `.controls-panel`: Replicate its dark backdrop blur and borders for consistent panel design.

### Integration Points
- `view3d.html`: Append HUD panel markup.
- `js/view3d.js`: Hook up input listeners, camera position/target tweener state, and render loop logic.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-interactive-hud-controls-view-presets*
*Context gathered: 2026-06-10*
