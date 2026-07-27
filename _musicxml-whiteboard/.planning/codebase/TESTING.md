# Testing Practices

This document outlines how testing is approached within the MusicXML Whiteboard Pro 3D project.

## Automated Testing
Currently, the project uses a strictly zero-build, static execution environment. As a result, no automated testing frameworks (like Jest, Mocha, Cypress, or Playwright) are configured or installed. 

There are no CI/CD pipelines executing unit tests on code commits.

## Manual Testing Patterns
Given the highly visual and interaction-heavy nature of the canvas application, the project relies on robust manual QA testing directly in the browser environment. 

Key workflows that must be manually verified during development include:
1. **File I/O Reliability**: Loading the sample JSON states and MusicXML files located in the `/esempi/` directory and ensuring no `console.error` logs are generated.
2. **DOM Performance**: Validating that pointer events (dragging `.measure-box` elements or SVG points) continue to operate smoothly at 60fps on large workspaces.
3. **Canvas Coordinates**: Zooming in and out, and validating that the `GRID_SIZE` snapping system aligns items consistently relative to the canvas origin.
4. **Export Mechanisms**: Generating test PDFs via `js/project.js` and verifying that `html2canvas` correctly captures all Z-index layers and compiles them properly via `jsPDF`.
5. **State Regression**: Drawing shapes, importing files, undoing steps using the UI buttons, and verifying that the `actionHistory` stack perfectly reflects state reversal without throwing exceptions.

## Test Data
The `/esempi/` directory holds "known good" project states that act as manual benchmark tests:
- `musicxml.xml`: A baseline sheet music file for testing the OpenSheetMusicDisplay parser.
- `schema_generale.json`, `test.json`, `luca_simone.json`: Assorted saved state snapshots that validate the `JSON.parse` logic and ensure backward compatibility when changes are made to the `tracks` data schema.
