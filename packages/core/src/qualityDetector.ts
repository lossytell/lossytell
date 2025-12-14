import { Input, BlobSource, MP4, MP3, WAVE, FLAC, OGG, ADTS } from 'mediabunny';
import type { QualityResult, QualityTier } from './types';
import { analyzeSpectrum, detectFrequencyCutoff } from './spectralAnalyzer';

/**
 * Quality tier thresholds based on typical lossy compression cutoff frequencies
 * These match observed rolloff points in spectral analysis
 */
const QUALITY_THRESHOLDS = {
	lossless: { minFreq: 19500, codecs: ['flac', 'pcm'] },
	high: { minFreq: 19500 }, // 320kbps MP3
	medium: { minFreq: 17500 }, // 192kbps MP3
	low: { minFreq: 15500 }, // 128kbps MP3
	very_low: { minFreq: 0 } // <128kbps or heavily transcoded
};

/**
 * Analyzes audio file quality by examining actual audio data
 * Ignores metadata to detect upscaled/fake high-quality files
 */
export async function analyzeAudioQuality(file: File): Promise<QualityResult> {
	const source = new BlobSource(file);
	const input = new Input({
		source,
		formats: [MP4, MP3, WAVE, FLAC, OGG, ADTS]
	});

	try {
		const format = await input.getFormat();
		const audioTrack = await input.getPrimaryAudioTrack();

		if (!audioTrack) {
			throw new Error('No audio track found');
		}

		const duration = await audioTrack.computeDuration();
		const sampleRate = audioTrack.sampleRate;
		const codec = audioTrack.codec ?? 'unknown';
		const packetStats = await audioTrack.computePacketStats();
		const bitrateValue = packetStats.averageBitrate;

		// Analyze spectrum
		const spectralData = await analyzeSpectrum(file);
		const cutoffFrequency = detectFrequencyCutoff(spectralData);

		// Determine quality tier based on detected cutoff
		const tier = determineQualityTier(cutoffFrequency, codec);
		const confidence = calculateConfidence(cutoffFrequency, tier);

		return {
			tier,
			detectedCutoffFrequency: cutoffFrequency,
			confidence,
			bitrate: bitrateValue ? `${Math.round(bitrateValue / 1000)} kbps` : 'unknown',
			codec,
			metadata: {
				sampleRate,
				duration,
				format: format.name
			},
			spectralData
		};
	} finally {
		input.dispose();
	}
}

/**
 * Determines quality tier based on frequency cutoff
 * Lossless formats are detected by codec name
 */
function determineQualityTier(cutoffFrequency: number | null, codec: string): QualityTier {
	// Check for lossless codecs
	if (QUALITY_THRESHOLDS.lossless.codecs.includes(codec)) {
		return 'lossless';
	}

	if (cutoffFrequency === null) {
		return 'unknown';
	}

	if (cutoffFrequency >= QUALITY_THRESHOLDS.high.minFreq) {
		return 'high';
	}

	if (cutoffFrequency >= QUALITY_THRESHOLDS.medium.minFreq) {
		return 'medium';
	}

	if (cutoffFrequency >= QUALITY_THRESHOLDS.low.minFreq) {
		return 'low';
	}

	return 'very_low';
}

/**
 * Calculates confidence score (0-1) based on how clearly
 * the frequency cutoff matches expected thresholds
 */
function calculateConfidence(cutoffFrequency: number | null, tier: QualityTier): number {
	// Lossless formats are definitively detected by codec - high confidence
	if (tier === 'lossless') return 0.95;

	if (cutoffFrequency === null) return 0;

	// For lossy formats, calculate confidence based on frequency cutoff accuracy
	// Define confidence bands around each threshold
	// Real audio files often exceed theoretical limits, so bands are wide
	const confidenceBands: Record<QualityTier, { center: number; band: number }> = {
		lossless: { center: 20000, band: 1000 },
		high: { center: 19500, band: 3500 }, // 16000-23000 Hz range
		medium: { center: 17500, band: 3000 }, // 14500-20500 Hz range
		low: { center: 15500, band: 3000 }, // 12500-18500 Hz range
		very_low: { center: 10000, band: 5000 },
		unknown: { center: 0, band: 0 }
	};

	const band = confidenceBands[tier];
	const distance = Math.abs(cutoffFrequency - band.center);
	const confidence = Math.max(0, 1 - distance / band.band);

	return Math.round(confidence * 100) / 100;
}
