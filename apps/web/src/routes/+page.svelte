<script lang="ts">
	let { isDragging } = $props();
	let uploadedFiles: Array<{
		file: File;
		addedAt: Date;
		path: string;
	}> = [];

	// async function getAllFileEntries(dataTransferItemList: DataTransferItemList) {
	// 	const fileEntries = [];
	// 	const queue = [];

	// 	for (let i = 0; i < dataTransferItemList.length; i++) {
	// 		queue.push(dataTransferItemList[i].webkitGetAsEntry());
	// 	}

	// 	while (queue.length > 0) {
	// 		const entry = queue.shift();
	// 		if (entry?.isFile) {
	// 			fileEntries.push(entry);
	// 		} else if (entry?.isDirectory) {
	// 			const reader = entry.createReader();
	// 			const entries = await new Promise<FileSystemEntry[]>((resolve) => {
	// 				reader.readEntries((entries) => resolve(entries));
	// 			});
	// 			queue.push(...entries);
	// 		}
	// 	}

	// 	return fileEntries;
	// }

	// async function processFileEntries(entries: FileSystemEntry[]) {
	// 	for (const entry of entries) {
	// 		if (entry.isFile) {
	// 			const fileEntry = entry as FileSystemFileEntry;
	// 			const file = await new Promise<File>((resolve) => {
	// 				fileEntry.file((file) => resolve(file));
	// 			});

	// 			if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a|flac)$/i)) {
	// 				addFile(file, entry.fullPath);
	// 			}
	// 		}
	// 	}
	// }

	function addFile(file: File, path: string = file.name) {
		uploadedFiles = [
			...uploadedFiles,
			{
				file,
				addedAt: new Date(),
				path: path.startsWith('/') ? path.slice(1) : path
			}
		];
	}

	function handleFiles(files: FileList | File[]) {
		for (const file of files) {
			if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a|flac)$/i)) {
				addFile(file);
			}
		}
	}

	function handleFileInput(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			handleFiles(input.files);
		}
	}
</script>

<main>
	<h1>lossytell</h1>

	<section aria-label="File Upload" class="upload-section">
		<div class="dropzone" role="button" tabindex="0">
			<label for="audioInput">Drag & drop audio files here or click to select</label>
			<input
				id="audioInput"
				type="file"
				accept="audio/*"
				webkitdirectory
				multiple
				onchange={handleFileInput}
			/>
		</div>
	</section>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		align-items: center;

		margin-block-start: 3rem;
	}

	.upload-section {
		position: relative;
		z-index: 1;
	}

	.dropzone {
		padding: 2rem;
		border: 2px dashed #ccc;
		border-radius: 4px;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s ease;
		margin: 2rem auto;
		max-width: 600px;
	}

	.dropzone input {
		display: none;
	}

	.dropzone label {
		display: block;
		cursor: pointer;
	}
</style>
