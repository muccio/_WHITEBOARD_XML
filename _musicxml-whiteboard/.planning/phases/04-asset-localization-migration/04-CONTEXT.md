# Phase 4 Context: Asset Localization & Migration

## Decisions
- **Directory Structure:** All external libraries will be stored in a `vendor/` directory at the project root.
- **Downloading Strategy:** Use a repeatable Bash script (`scripts/fetch-vendors.sh`) to fetch all CDN files.
- **Fonts:** Download Google Fonts (Outfit) `.woff2` files locally and update CSS to point to the local copies.

## Specifics
- Ensure `fetch-vendors.sh` is self-documenting and repeatable so we can easily update dependency versions later if needed.

## Deferred
- None.

## Canonical refs
- None.
