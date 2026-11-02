#!/usr/bin/env bash
# Builds a universal (Apple Silicon + Intel) release app for macOS.
set -euo pipefail
cd "$(dirname "$0")"

SCRIPT_DIR="$(pwd)"
SRC_WEB="$SCRIPT_DIR/../_musicxml-whiteboard"
DEST_WEB="$SCRIPT_DIR/MusicXMLWhiteboard/Resources/web"

echo "=== 1. Sincronizzazione risorse web ==="
mkdir -p "$DEST_WEB"
rsync -av --delete \
    --exclude=".git" \
    --exclude=".planning" \
    --exclude=".DS_Store" \
    --exclude="GEMINI.md" \
    "$SRC_WEB/" "$DEST_WEB/"

echo
echo "=== 2. Verifica icone macOS ==="
if [ ! -f "$SCRIPT_DIR/MusicXMLWhiteboard/Resources/AppIcon.icns" ]; then
    ./tools/generate_icons.sh
fi

echo
echo "=== 3. Generazione progetto Xcode con xcodegen ==="
if command -v xcodegen >/dev/null 2>&1; then
    xcodegen generate --spec project.yml
else
    echo "xcodegen non trovato: uso il progetto Xcode esistente." >&2
fi

echo
echo "=== 4. Compilazione Universal Release (arm64 + x86_64) ==="
DERIVED_DATA_TMP="/tmp/musicxml-whiteboard-build"
rm -rf "$DERIVED_DATA_TMP"

xcodebuild \
    -project MusicXMLWhiteboard.xcodeproj \
    -scheme MusicXMLWhiteboard \
    -configuration Release \
    -derivedDataPath "$DERIVED_DATA_TMP" \
    ARCHS="arm64 x86_64" \
    ONLY_ACTIVE_ARCH=NO \
    CODE_SIGN_IDENTITY="-" \
    CODE_SIGN_STYLE=Manual \
    build

mkdir -p build/Build/Products/Release
rm -rf "build/Build/Products/Release/MusicXML Whiteboard.app"
ditto "$DERIVED_DATA_TMP/Build/Products/Release/MusicXML Whiteboard.app" "build/Build/Products/Release/MusicXML Whiteboard.app"

APP="build/Build/Products/Release/MusicXML Whiteboard.app"
echo
echo "=== 5. Verifica e Architetture ==="
echo "App creata con successo in: $APP"
lipo -archs "$APP/Contents/MacOS/MusicXML Whiteboard"
codesign --verify --verbose=2 "$APP"
echo "✅ Build completata con successo!"
