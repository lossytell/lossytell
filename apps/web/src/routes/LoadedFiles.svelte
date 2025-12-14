<script lang="ts">
	let uploadedFiles: Array<{
		file: File;
		addedAt: Date;
		path: string;
	}> = [];

	// async function handleDrop(event: DragEvent) {
	// 	event.preventDefault();
	// 	if (!event.dataTransfer) return;

	// 	if (event.dataTransfer.items) {
	// 		const entries = await getAllFileEntries(event.dataTransfer.items);
	// 		await processFileEntries(entries);
	// 	} else if (event.dataTransfer.files) {
	// 		handleFiles(event.dataTransfer.files);
	// 	}
	// }

	function formatFileSize(bytes: number): string {
		const units = ['B', 'KB', 'MB', 'GB'];
		let size = bytes;
		let unitIndex = 0;

		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}

		return `${size.toFixed(1)} ${units[unitIndex]}`;
	}

	function removeFile(index: number) {
		uploadedFiles = uploadedFiles.filter((_, i) => i !== index);
	}
</script>

{#if uploadedFiles.length > 0}
	<section aria-label="Uploaded Files">
		<h2>Uploaded Files ({uploadedFiles.length})</h2>
		<div class="file-list" role="list">
			{#each uploadedFiles as { file, addedAt, path }, i (file.name + addedAt.getTime())}
				<article class="file-item" role="listitem">
					<details>
						<summary>
							<span class="file-name">{path}</span>
							<div class="file-actions">
								<time datetime={addedAt.toISOString()}>
									<!-- {formatDistanceToNow(addedAt, { addSuffix: true })} -->
								</time>
								<button
									type="button"
									class="remove-button"
									aria-label={`Remove ${file.name}`}
									on:click|stopPropagation={() => removeFile(i)}
								>
									✕
								</button>
							</div>
						</summary>
						<div class="file-details">
							<dl>
								<dt>Size</dt>
								<dd>{formatFileSize(file.size)}</dd>
								<dt>Type</dt>
								<dd>{file.type || 'audio/' + file.name.split('.').pop()}</dd>
								<dt>Last Modified</dt>
								<dd>
									<time datetime={file.lastModified.toString()}>
										{new Date(file.lastModified).toLocaleString()}
									</time>
								</dd>
							</dl>
						</div>
					</details>
				</article>
			{/each}
		</div>
	</section>
{/if}

<style>
	/* main.dragging .dropzone {
		border-color: #666;
		transform: scale(1.02);
		background: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	} */

	.file-list {
		margin-top: 2rem;
	}

	.file-item {
		margin: 0.5rem 0;
	}

	.file-item details {
		border: 1px solid #eee;
		border-radius: 4px;
	}

	.file-item summary {
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
	}

	.file-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.remove-button {
		padding: 0.25rem 0.5rem;
		background: transparent;
		color: #666;
		border: 1px solid currentColor;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.8rem;
		line-height: 1;
	}

	.remove-button:hover {
		color: #ff4444;
		border-color: currentColor;
	}

	.file-details {
		padding: 1rem;
		background: #f9f9f9;
	}

	.file-details dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem 1rem;
		margin: 0;
	}

	.file-details dt {
		font-weight: bold;
	}

	.file-details dd {
		margin: 0;
	}

	time {
		color: #666;
		font-size: 0.9em;
	}
</style>
