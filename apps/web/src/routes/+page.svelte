<script lang="ts">
	import { analyzeAudioQuality } from '@lossytell/core';

	interface QualityData {
		[key: string]: unknown;
	}

	interface FileAnalysis {
		name: string;
		quality: QualityData;
		loading: boolean;
	}

	let fileAnalysis: FileAnalysis[] = $state([]);
	let isDragging = $state(false);

	async function analyzeFile(file: File): Promise<QualityData> {
		const result = await analyzeAudioQuality(file);

		return {
			'Quality Tier': result.tier,
			Confidence: `${(result.confidence * 100).toFixed(1)}%`,
			'Detected Cutoff Frequency': result.detectedCutoffFrequency
				? `${result.detectedCutoffFrequency.toFixed(0)} Hz`
				: 'Unknown',
			Bitrate: result.bitrate,
			Codec: result.codec,
			'Sample Rate': `${result.metadata.sampleRate} Hz`,
			Duration: `${result.metadata.duration.toFixed(2)} seconds`,
			Format: result.metadata.format
		};
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const files = event.dataTransfer?.files;
		if (files) {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				if (!file) continue;

				const item: FileAnalysis = {
					name: file.name,
					quality: {},
					loading: true
				};
				const itemIndex = fileAnalysis.length;
				fileAnalysis.push(item);

				analyzeFile(file)
					.then((quality) => {
						if (fileAnalysis[itemIndex]) {
							fileAnalysis[itemIndex]!.quality = quality;
							fileAnalysis[itemIndex]!.loading = false;
						}
					})
					.catch((error) => {
						console.error('Error analyzing audio:', error);
						if (fileAnalysis[itemIndex]) {
							fileAnalysis[itemIndex]!.quality = { error: error.message };
							fileAnalysis[itemIndex]!.loading = false;
						}
					});
			}
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		event.dataTransfer!.dropEffect = 'copy';
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}
</script>

<div class="container">
	<div
		class="dropzone"
		class:dragging={isDragging}
		ondrop={handleDrop}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		role="button"
		tabindex="0"
	>
		<p>Drag & drop media files here to extract metadata</p>
		<p class="supported-formats">Supported: MP4, MOV, MKV, WebM, Ogg, MP3, WAV, AAC, FLAC</p>
	</div>

	<div class="results">
		{#each fileAnalysis as item (item.name)}
			<div class="file-result">
				<h3>{item.name}</h3>
				{#if item.loading}
					<p class="loading">Analyzing audio quality...</p>
				{:else}
					{@render renderQuality(item.quality)}
				{/if}
			</div>
		{/each}
	</div>
</div>

{#snippet renderQuality(data: unknown)}
	{#if typeof data === 'object' && data !== null && !Array.isArray(data)}
		<div class="quality-analysis">
			{#each Object.entries(data) as [key, value]}
				<div class="quality-item">
					<strong>{key}:</strong> <span>{value}</span>
				</div>
			{/each}
		</div>
	{:else}
		<p>Error analyzing file</p>
	{/if}
{/snippet}

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		max-width: 900px;
		margin: 0 auto;
	}

	.dropzone {
		width: 100%;
		padding: 3rem 2rem;
		border: 2px dashed #999;
		border-radius: 8px;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-bottom: 2rem;
		background-color: #f9f9f9;
	}

	.dropzone:hover {
		border-color: #666;
		background-color: #f0f0f0;
	}

	.dropzone.dragging {
		border-color: #0066cc;
		background-color: #e6f2ff;
		border-width: 2px;
	}

	.dropzone p {
		margin: 0;
		color: #666;
		font-size: 16px;
	}

	.supported-formats {
		margin-top: 0.5rem !important;
		font-size: 12px !important;
		color: #999 !important;
	}

	.results {
		width: 100%;
	}

	.file-result {
		margin-bottom: 2rem;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background-color: #fff;
	}

	.file-result h3 {
		margin: 0 0 1rem 0;
		color: #333;
		font-size: 18px;
	}

	.loading {
		color: #999;
		font-style: italic;
	}

	.quality-analysis {
		display: grid;
		gap: 0.75rem;
	}

	.quality-item {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: 1rem;
		padding: 0.5rem;
		border-bottom: 1px solid #eee;
	}

	.quality-item:last-child {
		border-bottom: none;
	}

	.quality-item strong {
		color: #333;
		font-weight: 600;
	}

	.quality-item span {
		color: #666;
		word-break: break-word;
	}
</style>
