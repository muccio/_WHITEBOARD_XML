#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SRC_ICON="$ROOT_DIR/_musicxml-whiteboard/icons/icon-512x512.png"
APPICONSET="$SCRIPT_DIR/../MusicXMLWhiteboard/Resources/Assets.xcassets/AppIcon.appiconset"

if [ ! -f "$SRC_ICON" ]; then
    echo "Errore: Icona sorgente non trovata in $SRC_ICON" >&2
    exit 1
fi

mkdir -p "$APPICONSET"
TEMP_ICONSET="$(mktemp -d)/AppIcon.iconset"
mkdir -p "$TEMP_ICONSET"

echo "Generazione icone macOS da $SRC_ICON..."

# Generate sizes for iconutil .iconset (converting to true PNG)
sips -s format png -z 16 16     "$SRC_ICON" --out "$TEMP_ICONSET/icon_16x16.png" >/dev/null
sips -s format png -z 32 32     "$SRC_ICON" --out "$TEMP_ICONSET/icon_16x16@2x.png" >/dev/null
sips -s format png -z 32 32     "$SRC_ICON" --out "$TEMP_ICONSET/icon_32x32.png" >/dev/null
sips -s format png -z 64 64     "$SRC_ICON" --out "$TEMP_ICONSET/icon_32x32@2x.png" >/dev/null
sips -s format png -z 128 128   "$SRC_ICON" --out "$TEMP_ICONSET/icon_128x128.png" >/dev/null
sips -s format png -z 256 256   "$SRC_ICON" --out "$TEMP_ICONSET/icon_128x128@2x.png" >/dev/null
sips -s format png -z 256 256   "$SRC_ICON" --out "$TEMP_ICONSET/icon_256x256.png" >/dev/null
sips -s format png -z 512 512   "$SRC_ICON" --out "$TEMP_ICONSET/icon_256x256@2x.png" >/dev/null
sips -s format png -z 512 512   "$SRC_ICON" --out "$TEMP_ICONSET/icon_512x512.png" >/dev/null
sips -s format png -z 1024 1024 "$SRC_ICON" --out "$TEMP_ICONSET/icon_512x512@2x.png" >/dev/null

# Copy to xcassets AppIcon.appiconset
cp "$TEMP_ICONSET/icon_16x16.png" "$APPICONSET/icon_16x16.png"
cp "$TEMP_ICONSET/icon_16x16@2x.png" "$APPICONSET/icon_16x16@2x.png"
cp "$TEMP_ICONSET/icon_32x32.png" "$APPICONSET/icon_32x32.png"
cp "$TEMP_ICONSET/icon_32x32@2x.png" "$APPICONSET/icon_32x32@2x.png"
cp "$TEMP_ICONSET/icon_128x128.png" "$APPICONSET/icon_128x128.png"
cp "$TEMP_ICONSET/icon_128x128@2x.png" "$APPICONSET/icon_128x128@2x.png"
cp "$TEMP_ICONSET/icon_256x256.png" "$APPICONSET/icon_256x256.png"
cp "$TEMP_ICONSET/icon_256x256@2x.png" "$APPICONSET/icon_256x256@2x.png"
cp "$TEMP_ICONSET/icon_512x512.png" "$APPICONSET/icon_512x512.png"
cp "$TEMP_ICONSET/icon_512x512@2x.png" "$APPICONSET/icon_512x512@2x.png"

cat << 'EOF' > "$APPICONSET/Contents.json"
{
  "images" : [
    {
      "size" : "16x16",
      "idiom" : "mac",
      "filename" : "icon_16x16.png",
      "scale" : "1x"
    },
    {
      "size" : "16x16",
      "idiom" : "mac",
      "filename" : "icon_16x16@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "32x32",
      "idiom" : "mac",
      "filename" : "icon_32x32.png",
      "scale" : "1x"
    },
    {
      "size" : "32x32",
      "idiom" : "mac",
      "filename" : "icon_32x32@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "128x128",
      "idiom" : "mac",
      "filename" : "icon_128x128.png",
      "scale" : "1x"
    },
    {
      "size" : "128x128",
      "idiom" : "mac",
      "filename" : "icon_128x128@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "256x256",
      "idiom" : "mac",
      "filename" : "icon_256x256.png",
      "scale" : "1x"
    },
    {
      "size" : "256x256",
      "idiom" : "mac",
      "filename" : "icon_256x256@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "512x512",
      "idiom" : "mac",
      "filename" : "icon_512x512.png",
      "scale" : "1x"
    },
    {
      "size" : "512x512",
      "idiom" : "mac",
      "filename" : "icon_512x512@2x.png",
      "scale" : "2x"
    }
  ],
  "info" : {
    "version" : 1,
    "author" : "xcode"
  }
}
EOF

# Also compile .icns for standalone usage
iconutil -c icns "$TEMP_ICONSET" -o "$SCRIPT_DIR/../MusicXMLWhiteboard/Resources/AppIcon.icns"
rm -rf "$TEMP_ICONSET"
echo "Icone generate con successo in $APPICONSET e AppIcon.icns"
