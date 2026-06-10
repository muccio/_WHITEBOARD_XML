# External Integrations

**Analysis Date:** 2026-06-10

## APIs & External Services

**Payment Processing:**
- None.

**Email/SMS:**
- None.

**External APIs:**
- None.

## Data Storage

**Databases:**
- None.

**File Storage:**
- Local File System (Browser-driven upload/download):
  - **MusicXML Import:** Loaded locally using `FileReader` in `js/musicxml.js`. Supported formats: `.xml`, `.musicxml`, `.mxl`.
  - **Project JSON Save/Load:** Tracks, SVG drawing content, and HTML measure boxes are serialized to JSON and downloaded as files, or loaded back via `FileReader` in `js/project.js`.
  - **Background Layer JSON:** Multi-layered project sketches loaded dynamically via `FileReader` in `js/ui.js` and combined visually.
  - **Audio Import:** Wave/spectrogram files (`.wav`, `.mp3`, `.m4a`, `.ogg`) loaded via `FileReader` in `audio-tool.html`.

**Caching:**
- In-memory state only. The application relies on memory variables and the browser Session history (Undo/Redo stack) for transient persistence.

## Authentication & Identity

**Auth Provider:**
- None.

**OAuth Integrations:**
- None.

## Monitoring & Observability

**Error Tracking:**
- None.

**Analytics:**
- None.

**Logs:**
- Browser standard Console logs (stdout/stderr mapped to Developer tools).

## CI/CD & Deployment

**Hosting:**
- Static host environment. No backend deployment is required.

**CI Pipeline:**
- None.

## Environment Configuration

**Development:**
- No environment variables or local credentials needed. Examples and assets are kept in the `esempi/` directory.

**Staging:**
- None.

**Production:**
- None.

## Webhooks & Callbacks

**Incoming:**
- None.

**Outgoing:**
- None.

---

*Integration audit: 2026-06-10*
*Update when adding/removing external services*
