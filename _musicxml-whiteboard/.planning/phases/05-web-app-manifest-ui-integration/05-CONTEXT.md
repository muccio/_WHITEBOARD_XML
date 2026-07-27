# Phase 5: Web App Manifest & UI Integration

## Domain
Progressive Web App (PWA) manifest registration and related UI integration (install prompt and offline status indicators).

## Decisions

### Install Prompt (PWA-02)
- **Decision:** Add an "Install App" button to the main controls panel (`.controls-panel`).
- **Behavior:** The button will be hidden by default and only appear when the `beforeinstallprompt` event is fired and the app is installable.

### Offline Indicator (SYNC-05)
- **Decision:** Add a small status dot/badge in the main controls panel.
- **Visuals:** Green dot = Online, Red dot = Offline.
- **Toast:** A brief toast notification will also appear temporarily on state change ("You are now offline", "Back online").

### App Icon (PWA-01)
- **Decision:** Generate a temporary placeholder icon (e.g., a music note with a 3D box) for the manifest.
- **Action:** The planner/executor will generate this icon and include it in the `manifest.json`.

## Canonical Refs
- Requirements: PWA-01, PWA-02, SYNC-05

## Deferred Ideas
None.
