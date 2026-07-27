#!/bin/bash

# Exit on any error
set -e

# Define directories
VENDOR_DIR="vendor"
FONTS_DIR="${VENDOR_DIR}/fonts"

echo "Creating vendor directories..."
mkdir -p "$FONTS_DIR"

echo "Downloading JavaScript libraries..."

# OpenSheetMusicDisplay
curl -L -o "$VENDOR_DIR/opensheetmusicdisplay.min.js" \
  "https://cdn.jsdelivr.net/npm/opensheetmusicdisplay@1.6.1/build/opensheetmusicdisplay.min.js"

# html2canvas
curl -L -o "$VENDOR_DIR/html2canvas.min.js" \
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"

# jsPDF
curl -L -o "$VENDOR_DIR/jspdf.umd.min.js" \
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"

# Three.js
curl -L -o "$VENDOR_DIR/three.min.js" \
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"

# OrbitControls.js
curl -L -o "$VENDOR_DIR/OrbitControls.js" \
  "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"

echo "Downloading Google Fonts (Outfit)..."

# Outfit - Latin Ext
curl -L -o "$FONTS_DIR/outfit-latin-ext.woff2" \
  "https://fonts.gstatic.com/s/outfit/v15/QGYvz_MVcBeNP4NJuktqUYLkn8BJ.woff2"

# Outfit - Latin
curl -L -o "$FONTS_DIR/outfit-latin.woff2" \
  "https://fonts.gstatic.com/s/outfit/v15/QGYvz_MVcBeNP4NJtEtqUYLknw.woff2"

echo "Downloading Google Fonts CSS structure..."
# We download the CSS for reference to ensure we have the correct unicode ranges
curl -s -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36" \
  "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" > "$FONTS_DIR/outfit-original.css"

echo "Done! All vendor assets downloaded to $VENDOR_DIR/"
