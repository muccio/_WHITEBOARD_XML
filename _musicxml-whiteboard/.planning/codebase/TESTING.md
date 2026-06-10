# Testing Patterns

**Analysis Date:** 2026-06-10

## Test Framework

**Runner:**
- None. There is no automated testing suite (such as Jest, Vitest, or Playwright) configured in this repository.

**Assertion Library:**
- None.

**Run Commands:**
- Since there are no automated tests, no CLI test script exists. The application is tested manually in the browser.

## Test File Organization

**Location:**
- No test files (`*.test.js` or `*.spec.js`) exist in this codebase.

**Test Data (Fixtures):**
- Mock/Example files are located in `esempi/` directory:
  - `esempi/musicxml.xml` - MusicXML notation file for testing sheet music imports.
  - `esempi/*.json` - Pre-saved projects for verifying workspace loading, layered schizzi, track counts, and drawings.

## Manual Verification Plan

To verify the correct behavior of the whiteboard, the developer should execute the following test cases in a web browser:

### 1. Multi-Track Actions
- **Add Track:** Click `+ Nuova Traccia`, input a name, and verify that the track is drawn horizontally with a red timeline line and major/minor second ticks.
- **Track Isolation:** Select a track in `Traccia Attiva` selector. Verify that inactive tracks fade out and block mouse events (`pointer-events: none`).
- **Rename Track:** Select a track, click `✏️ Rinomina`, enter a new name, and verify that the select option is updated.
- **Track Spacing:** Drag the `Dist. Tracce` slider and verify that the tracks move closer or further apart vertically in real time.

### 2. Graphical Drawing Tools
- **Freehand/Line/Rect/Circle:** Select a tool, click and drag on the active track canvas, and confirm the shape is drawn. Try with/without snap-grid.
- **Bezier Curves:** Select `bezier` tool, make 4 sequential clicks. Verify the curve is rendered. Switch to `select` tool, drag the red control points, and verify the curve adjusts dynamically.
- **Element Mirroring:** Enable `mirror-draw` checkbox, draw a path, and verify that an identical flipped shape is rendered symmetrically across the track baseline.
- **Shape Eraser:** Select `eraser` tool, click on a drawing element, and verify it is removed from the DOM.

### 3. MusicXML Parsing
- **Import Score:** Select `Scegli file` in Menu and load `esempi/musicxml.xml`. Verify that the page splits the score into measure boxes labeled `M 1`, `M 2`, etc.
- **Measure Repositioning:** Select and drag a measure box. Turn on snap-grid, drag the box, and verify it snaps to grid increments.
- **Measure Duplication:** Hold <kbd>Alt</kbd> (Option) and drag an existing measure box. Verify a clone is spawned.

### 4. Project Portability & Rendering
- **Save Project:** Click `💾 Salva`, verify that a JSON file downloads with the project title.
- **Load Project:** Refresh the browser, click `📂 Carica`, select the downloaded JSON, and verify that tracks, drawings, imported measures, and configuration are restored.
- **PDF Export:** Click `📄 PDF`. Verify that the browser initiates a PDF download. Open the PDF and check that it contains the composites of `#y-axis-canvas` and `#workspace` correctly cropped around content borders.

### 5. Audio Tools
- **Audio Loading:** Open `audio-tool.html`, upload an audio file (`.mp3` or `.wav`), and verify the status changes from decodification to processing.
- **Visualization:** Verify the Waveform and Spectrogram graphs are computed and drawn, showing color gradients based on sound frequency magnitudes.

---

*Testing analysis: 2026-06-10*
*Update when testing patterns or automation tools change*
