export interface SpectralData {
	frequencies: number[];
	magnitudes: number[];
	sampleRate: number;
	timestamp: number;
}

export type QualityTier = 'lossless' | 'high' | 'medium' | 'low' | 'very_low' | 'unknown';

export interface QualityResult {
	tier: QualityTier;
	detectedCutoffFrequency: number | null;
	confidence: number; // 0-1
	bitrate: string;
	codec: string;
	metadata: {
		sampleRate: number;
		duration: number;
		format: string;
	};
	spectralData: SpectralData[];
}
