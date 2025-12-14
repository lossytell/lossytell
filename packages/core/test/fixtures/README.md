# Test Fixtures Guide

This directory contains audio test fixtures for validating audio quality detection heuristics.

## Quick Start

### Generating All Fixtures from a Source File

Use the `generate-fixtures.sh` script to create all test files from a single lossless source:

```bash
cd packages/core/test/fixtures
./generate-fixtures.sh path/to/your/source.wav
```

This generates:

- **Authentic files**: `true_320kbps.mp3`, `true_192kbps.mp3`, `true_128kbps.mp3`, `true_lossless.flac`
- **Fake/upscaled files**: `fake_320_from_128.mp3`, `fake_320_from_192.mp3`, `fake_192_from_128.mp3`

The script requires `ffmpeg` available via `pkgx ffmpeg` (or modify the script to use `ffmpeg` directly).

---

## Adding a New Audio Sample

If you have a real audio file you want to test against:

### 1. Convert to Lossless Reference

If your file isn't lossless, convert it:

```bash
cd packages/core/test/fixtures
pkgx ffmpeg -i your_file.mp3 -c:a pcm_s16le your_file_reference.wav
```

### 2. Generate All Variants

```bash
./generate-fixtures.sh your_file_reference.wav
```

This creates a complete test suite including authentic and fake versions.

### 3. Name Your Suite (Optional)

To organize multiple test sets, move the files to a subdirectory:

```bash
mkdir -p my_audio_suite
mv true_*.mp3 true_*.flac fake_*.mp3 my_audio_suite/
```

### 4. Update Tests

Reference the new fixtures in your test file ([spectralAnalyzer.test.ts](spectralAnalyzer.test.ts)):

```typescript
import { analyzeAudioQuality } from '../src/qualityDetector';
import myAudioFile from './fixtures/my_audio_suite/true_320kbps.mp3?url';

test('detects authentic 320kbps from my_audio_suite', async () => {
	const response = await fetch(myAudioFile);
	const file = new File([await response.blob()], 'test.mp3');
	const result = await analyzeAudioQuality(file);

	expect(result.tier).toBe('high');
	expect(result.detectedCutoffFrequency).toBeGreaterThan(19000);
});
```

---

## File Naming Convention

- **`true_*kbps.mp3`**: Authentically encoded at specified bitrate
- **`true_lossless.*`**: Lossless format (FLAC, WAV, etc.)
- **`fake_*kbps_from_*.mp3`**: Re-encoded at higher bitrate from lower source (detection test case)

---

## Test Case: `test_128kbps`

If you have a pre-existing `test_128kbps` sample already in fixtures:

### Option 1: Use It As Base

```bash
cd packages/core/test/fixtures
# Copy it as source reference
cp test_128kbps.mp3 test_128kbps_reference.wav
# Generate variants
./generate-fixtures.sh test_128kbps_reference.wav
```

### Option 2: Include It In Tests

Reference it directly in tests:

```typescript
import testSample from './fixtures/test_128kbps.mp3?url';

test('correctly identifies 128kbps file', async () => {
	const response = await fetch(testSample);
	const file = new File([await response.blob()], 'test.mp3');
	const result = await analyzeAudioQuality(file);

	expect(result.tier).toBe('low'); // 128kbps = low quality
	expect(result.detectedCutoffFrequency).toBeLessThan(16500);
});
```

---

## Current Fixtures Structure

```
test/fixtures/
├── generate-fixtures.sh          # Regeneration script
├── source_reference.wav          # Base lossless source (auto-created)
├── true_320kbps.mp3             # Authentic 320kbps
├── true_192kbps.mp3             # Authentic 192kbps
├── true_128kbps.mp3             # Authentic 128kbps
├── true_lossless.flac           # Lossless FLAC
├── fake_320_from_128.mp3        # 128kbps re-encoded as 320kbps
├── fake_320_from_192.mp3        # 192kbps re-encoded as 320kbps
├── fake_192_from_128.mp3        # 128kbps re-encoded as 192kbps
└── test_128kbps.mp3             # (optional) your custom sample
```

---

## Regenerating All Fixtures

If you update the source quality or want to refresh:

```bash
cd packages/core/test/fixtures
rm true_*.mp3 true_*.flac fake_*.mp3
./generate-fixtures.sh source_reference.wav
```

Or use a completely different source:

```bash
./generate-fixtures.sh /path/to/new/source.wav
```

---

## Notes

- The `source_reference.wav` is automatically created and can be replaced with any lossless audio
- Fake files test the core detector's ability to identify upscaled/transcoded files
- For best results, use high-quality source material (320kbps or lossless) when creating the base reference
