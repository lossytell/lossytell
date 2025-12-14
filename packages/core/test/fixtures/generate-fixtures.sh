#!/bin/bash
# generate-fixtures.sh
# Generates all test audio fixtures from a single lossless source WAV file
# Usage: ./generate-fixtures.sh <input.wav>
# Example: ./generate-fixtures.sh source.wav

set -e

if [ $# -eq 0 ]; then
    echo "Usage: ./generate-fixtures.sh <input.wav>"
    echo "Example: ./generate-fixtures.sh source.wav"
    echo ""
    echo "This script generates all test fixtures from a single lossless source file:"
    echo "  - true_*kbps.mp3: Authentically encoded at specified bitrate"
    echo "  - fake_*kbps_from_*.mp3: Upscaled fake files (re-encoded higher bitrate)"
    echo "  - true_lossless.flac: Lossless FLAC copy"
    exit 1
fi

INPUT_FILE="$1"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' not found"
    exit 1
fi

echo "📁 Generating fixtures from: $INPUT_FILE"
echo ""

# Copy input to script directory as source reference
cp "$INPUT_FILE" "$SCRIPT_DIR/source_reference.wav"
echo "✓ Created source reference"

# Generate authentic bitrate versions
echo ""
echo "🎵 Generating authentic bitrate files..."
pkgx ffmpeg -i "$SCRIPT_DIR/source_reference.wav" -b:a 320k "$SCRIPT_DIR/true_320kbps.mp3" -y 2>&1 | grep -E "error" || echo "✓ 320kbps authentic"
pkgx ffmpeg -i "$SCRIPT_DIR/source_reference.wav" -b:a 192k "$SCRIPT_DIR/true_192kbps.mp3" -y 2>&1 | grep -E "error" || echo "✓ 192kbps authentic"
pkgx ffmpeg -i "$SCRIPT_DIR/source_reference.wav" -b:a 128k "$SCRIPT_DIR/true_128kbps.mp3" -y 2>&1 | grep -E "error" || echo "✓ 128kbps authentic"

# Generate lossless FLAC
pkgx ffmpeg -i "$SCRIPT_DIR/source_reference.wav" -c:a flac "$SCRIPT_DIR/true_lossless.flac" -y 2>&1 | grep -E "error" || echo "✓ FLAC lossless"

# Generate fake high-quality files (upscaled lower bitrates)
echo ""
echo "🎭 Generating fake/upscaled files..."
pkgx ffmpeg -i "$SCRIPT_DIR/true_128kbps.mp3" -b:a 320k "$SCRIPT_DIR/fake_320_from_128.mp3" -y 2>&1 | grep -E "error" || echo "✓ Fake 320k (from 128k source)"
pkgx ffmpeg -i "$SCRIPT_DIR/true_192kbps.mp3" -b:a 320k "$SCRIPT_DIR/fake_320_from_192.mp3" -y 2>&1 | grep -E "error" || echo "✓ Fake 320k (from 192k source)"
pkgx ffmpeg -i "$SCRIPT_DIR/true_128kbps.mp3" -b:a 192k "$SCRIPT_DIR/fake_192_from_128.mp3" -y 2>&1 | grep -E "error" || echo "✓ Fake 192k (from 128k source)"

echo ""
echo "✅ All fixtures generated successfully!"
echo ""
ls -lh "$SCRIPT_DIR"/*.mp3 "$SCRIPT_DIR"/*.flac 2>/dev/null | awk '{print "  " $9, "(" $5 ")"}'
