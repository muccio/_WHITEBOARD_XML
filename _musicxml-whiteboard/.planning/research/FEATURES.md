# Research: FEATURES

**Question:** How do PWA & Offline features typically work? Expected behavior?

**Findings:**
- **Table Stakes:**
  - App install prompt (A2HS) triggered manually or automatically.
  - Complete offline load of all files (HTML, JS, CSS).
  - Offline status indicator when internet is disconnected.
- **Differentiators:**
  - Background sync (Not needed here).
- **Dependencies:**
  - All local files must be explicitly declared in the SW install event to cache them initially.

**Consumer Guidance:**
Focus on a bulletproof Cache-First strategy for static files.
