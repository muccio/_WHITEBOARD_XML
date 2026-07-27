# Phase 1: GUI Integration & Data Bridge - Context

**Gathered:** 2026-06-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up the launch controls in the main whiteboard editor and establish dynamic memory-based data sharing with a new child pop-up window (`view3d.html` / `js/view3d.js`). The focus is strictly on GUI integration and the window opener data bridge. Real-time rendering of 3D geometry is out of scope for this phase.

</domain>

<decisions>
## Implementation Decisions

### GUI Launcher Control
- **D-01:** Place a "📦 3D" visualizer button in the primary controls panel (`#controls` in `index.html`), positioned directly next to the "🔊 Audio" button.
- **D-02:** Style the button to match existing `.btn-custom` elements with a premium teal color theme:
  - Background: `#3c635b`
  - Border: `#51877a`
  - Text Color: `#6cefda`
- **D-03:** The launcher triggers a pop-up window of dimensions `1200x800` centered on the user's screen using `window.open(..., 'view3d', 'width=1200,height=800,resizable=yes,scrollbars=yes')`.

### Data Bridge & Synchronization
- **D-04:** The child page `view3d.html` accesses the parent window's state dynamically at load time via `window.opener`. Avoid local/session storage to circumvent quota limitations and browser sandbox restrictions on `file://` protocols.
- **D-05:** Synchronize the following state from the parent whiteboard editor to enable timeline alignment in the WebGL scene:
  - `tracks` (live coordinates, track names, SVG layers, and measure box positions)
  - `totalSec` (total whiteboard duration in seconds)
  - `gridSec` (timeline scale: seconds per major grid square)
  - `globalTrackSpacing` (vertical spacing between tracks)
  - `customLegend` (custom notation categories)

### Fallback Behavior (No Opener)
- **D-06:** If `view3d.html` is launched directly without a parent window (`window.opener` is null/inaccessible), display a clean overlay informing the user that the visualizer must be opened from the whiteboard editor, with a link to return to `index.html`.
- **D-07:** For testing and standalone debugging, automatically populate and load mock track and timeline data when the opener is absent.

### the agent's Discretion
- Centering calculation details for centering the pop-up window relative to the parent window or primary monitor.
- Exact text formatting and aesthetic design of the warning overlay for the no-opener fallback.
- Internal folder and file layout of `js/view3d.js` structure.

</decisions>

<canonical_refs>
## Canonical References

### Requirements & Roadmap
- [.planning/REQUIREMENTS.md](file:///Users/mariosalvucci/Documents/Development/WEBDEV/_WHITEBOARD_XML/_musicxml-whiteboard/.planning/REQUIREMENTS.md) §v1 Requirements: Setup & Sync (SYNC-01, SYNC-02, ISOL-01)
- [.planning/ROADMAP.md](file:///Users/mariosalvucci/Documents/Development/WEBDEV/_WHITEBOARD_XML/_musicxml-whiteboard/.planning/ROADMAP.md) §Phase 1 details

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `style.css` `.btn-custom`: Use standard button styling variables for UI consistency.
- `js/globals.js`: Serves as reference for global variables (e.g. `tracks`, `totalSec`, `gridSec`) that the bridge needs to read.

### Established Patterns
- Separate html/js execution files (`audio-tool.html` and inline script) - matches our plan of using `view3d.html` and `js/view3d.js` for isolated visualizer execution.

### Integration Points
- `index.html` controls panel (`#controls`) - target for inserting the 3D button.
- `js/main.js` window setup listeners - target for attaching click handler to the 3D button.

</code_context>

<deferred>
## Deferred Ideas

- **SYNC-03 (Real-time updates)**: Automatically redraw the 3D scene in real-time as users modify elements in the 2D editor. (Deferred to v2 / Backlog).

</deferred>

---

*Phase: 01-gui-integration-data-bridge*
*Context gathered: 2026-06-10*
