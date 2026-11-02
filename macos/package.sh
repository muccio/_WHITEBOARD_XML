#!/usr/bin/env bash
# Builds the universal app and produces the distributable zip and dmg in dist/.
set -euo pipefail
cd "$(dirname "$0")"

./build.sh

APP="build/Build/Products/Release/MusicXML Whiteboard.app"
VERSION=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$APP/Contents/Info.plist")
NAME="MusicXML-Whiteboard-$VERSION-macOS-universal"

rm -rf dist
mkdir -p dist

echo
echo "=== Creazione pacchetto di distribuzione ==="
ditto "$APP" "dist/MusicXML Whiteboard.app"
codesign --force --deep --sign - "dist/MusicXML Whiteboard.app"

echo "Creazione archivio ZIP: dist/$NAME.zip..."
ditto -c -k --keepParent "dist/MusicXML Whiteboard.app" "dist/$NAME.zip"

echo "Creazione immagine disco DMG: dist/$NAME.dmg..."
hdiutil create \
    -volname "MusicXML Whiteboard" \
    -srcfolder "dist/MusicXML Whiteboard.app" \
    -ov -format UDZO \
    "dist/$NAME.dmg" >/dev/null

echo
echo "=== Risultati in dist/ ==="
ls -lh dist
echo
echo "=== Checksum SHA256 ==="
shasum -a 256 "dist/$NAME.zip" "dist/$NAME.dmg"
echo "✅ Packaging completato con successo!"
