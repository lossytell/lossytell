import { describe, it, expect } from 'vitest';
import { analyzeAudioQuality } from '@lossytell/core';

/**
 * Quality Detection Test Suite
 * Tests authentic MP3 files at various bitrates generated from lossless source
 *
 * Fixture generation: packages/core/test/fixtures/generate-fixtures.sh lossless.wav
 */

// Fixture URLs - inline definition
const FIXTURES = {
	authentic: {
		mp3_320k: new URL('./fixtures/true_320kbps.mp3', import.meta.url).href,
		mp3_192k: new URL('./fixtures/true_192kbps.mp3', import.meta.url).href,
		mp3_128k: new URL('./fixtures/true_128kbps.mp3', import.meta.url).href,
		flac_lossless: new URL('./fixtures/true_lossless.flac', import.meta.url).href
	},
	fake: {
		mp3_128to320: new URL('./fixtures/fake_320_from_128.mp3', import.meta.url).href,
		mp3_128to192: new URL('./fixtures/fake_192_from_128.mp3', import.meta.url).href,
		mp3_192to320: new URL('./fixtures/fake_320_from_192.mp3', import.meta.url).href
	}
};

async function fetchAudioFile(url: string): Promise<File> {
	const response = await fetch(url);
	const blob = await response.blob();
	const filename = url.split('/').pop() || 'audio.mp3';
	return new File([blob], filename, { type: blob.type });
}

describe('Authentic MP3 Files', () => {
	const authenticCases = [
		{
			name: 'true_320kbps.mp3',
			url: FIXTURES.authentic.mp3_320k,
			expectedTier: 'high',
			minCutoff: 19000,
			maxCutoff: 22000, // Real files can exceed 20kHz
			minConfidence: 0.35 // Lower for 320k due to full spectrum
		},
		{
			name: 'true_192kbps.mp3',
			url: FIXTURES.authentic.mp3_192k,
			expectedTier: 'medium',
			minCutoff: 17500,
			maxCutoff: 19000,
			minConfidence: 0.5
		},
		{
			name: 'true_128kbps.mp3',
			url: FIXTURES.authentic.mp3_128k,
			expectedTier: 'low',
			minCutoff: 15500,
			maxCutoff: 17500,
			minConfidence: 0.5
		}
	];

	it.each(authenticCases)(
		'detects $name as $expectedTier',
		async ({ url, expectedTier, minCutoff, maxCutoff, minConfidence }) => {
			const file = await fetchAudioFile(url);
			const result = await analyzeAudioQuality(file);

			expect(result.tier).toBe(expectedTier);
			expect(result.detectedCutoffFrequency).toBeGreaterThanOrEqual(minCutoff);
			expect(result.detectedCutoffFrequency).toBeLessThanOrEqual(maxCutoff);
			expect(result.confidence).toBeGreaterThan(minConfidence);
		}
	);
});

describe('Lossless Format', () => {
	it('detects FLAC as lossless with full bandwidth', async () => {
		const file = await fetchAudioFile(FIXTURES.authentic.flac_lossless);
		const result = await analyzeAudioQuality(file);

		expect(result.tier).toBe('lossless');
		expect(result.confidence).toBeGreaterThan(0.9);
		if (result.detectedCutoffFrequency) {
			expect(result.detectedCutoffFrequency).toBeGreaterThan(20000);
		}
	});
});

describe.skip('Upscaled/Fake Files - FFT Required', () => {
	/**
	 * SKIP: Upscale detection requires real FFT analysis of decoded audio
	 *
	 * Current limitation: We use averageBitrate from mediabunny, which reflects
	 * the *re-encoded* file bitrate, not the true source bitrate.
	 *
	 * Example: fake_320_from_128.mp3 contains 128kbps audio but the file header
	 * claims 320kbps. After re-encoding as a 320k MP3, averageBitrate returns ~320k.
	 *
	 * Solution: Implement real-time FFT on decoded PCM samples to detect actual
	 * frequency rolloff, which cannot be faked through re-encoding.
	 *
	 * The upscaled files exist as fixtures for when FFT is implemented.
	 */

	const fakeCases = [
		{
			name: 'fake_320_from_128.mp3',
			url: FIXTURES.fake.mp3_128to320,
			description: '128kbps source re-encoded to 320kbps claim',
			note: 'Will be detected via FFT frequency analysis (future)'
		},
		{
			name: 'fake_192_from_128.mp3',
			url: FIXTURES.fake.mp3_128to192,
			description: '128kbps source re-encoded to 192kbps claim',
			note: 'Will be detected via FFT frequency analysis (future)'
		},
		{
			name: 'fake_320_from_192.mp3',
			url: FIXTURES.fake.mp3_192to320,
			description: '192kbps source re-encoded to 320kbps claim',
			note: 'Will be detected via FFT frequency analysis (future)'
		}
	];
});
