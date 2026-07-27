# Coding Conventions

This document details the naming conventions, code style, error handling, and formatting rules used across the project.

## Naming Patterns
- **Script Extensions & Assets**: `kebab-case` (`svg-engine.js`, `audio-tool.html`, `style.css`).
- **Function Names**: `camelCase` (`addTrack()`, `saveHistoryState()`, `makeDraggable()`).
- **Event Handlers**: The `onEventName` pattern is heavily favored (`onPointerMove()`, `onPointerUp()`, `onWheel()`).
- **Local & Global Variables**: `camelCase` (`drawSvg`, `activeTrackId`, `selectedElement`).
- **Structural Constants**: `UPPER_SNAKE_CASE` is utilized for key visual boundaries or system limits (`GRID_SIZE`, `MAX_HISTORY`, `WORKSPACE_CENTER_Y`).
- **HTML IDs**: `kebab-case` (`proj-title`, `btn-undo`, `workspace-wrapper`).
- **HTML Classes**: `kebab-case` (`controls-panel`, `measure-box`, `bezier-control-point`).

## Code Style
- **Indentation**: 4-space indentation for logic blocks.
- **Semicolons**: Required at the end of every statement.
- **Quotes**: Double quotes (`"`) are strictly preferred for string attributes in HTML markup. In JavaScript, both single (`'`) and double quotes (`"`) are allowed interchangeably.
- **Line Length**: Lines are generally kept under 120 characters where possible. Inline callbacks can be compressed.
- **Early Return**: Functions heavily employ early exit guard clauses (e.g., `if (!selectedElement) return;`) to keep nesting shallow and improve readability.
- **Scope Isolation**: Rather than addressing the `window` scope dynamically, functions should reference the explicitly initialized global context variables declared in `js/globals.js`.

## Error Handling
- **Local Try/Catch Blocks**: Wrap error-prone segments, particularly file parsing (`JSON.parse` for project files and `osmd.load` for MusicXML) and image/PDF capture cycles inside `try...catch`.
- **Graceful Degradation**: Utilizing native browser `alert()` popups to warn users about file corruption, unrecognized formats, or permission blocks. State mutating functions must ensure the current canvas drawing state is preserved if an exception is thrown midway.

## Logging
- **Console Outputs**: Standard native loggers (`console.log`, `console.warn`, `console.error`) are left in the code to document asset loaders, missing layers, or viewport calculation offsets for runtime debugging. No remote telemetry is active.

## Comments
- **Headers**: Use standard header blocks to demarcate files (`/* js/globals.js */`).
- **Explanations**: Write clean, concise comments to document heavy math conversions, coordinate boundary checking, and scaling calculations.
- **Language**: Comments can be a mix of English and Italian. The existing codebase relies heavily on Italian comments (e.g., `// GESTIONE TRACCE`, `// SISTEMA MULTI-TRACCIA & LAYERS`). Match the language style of the surrounding component when authoring new code.
