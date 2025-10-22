<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
	let isDragging = $state(false);

	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		const relatedTarget = e.relatedTarget as Node | null;

		if (!relatedTarget || relatedTarget === document || relatedTarget.nodeName === 'HTML') {
			isDragging = false;
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<svelte:body
	ondragenter={handleDragEnter}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
/>

<div id="app" data-dragging={isDragging}>
	<nav>
		<menu>
			<li>
				<a href="/about">About</a>
			</li>
			<li>
				<a href="https://github.com/lossytell/lossytell" target="_blank" rel="noopener noreferrer"
					>GitHub</a
				>
			</li>
		</menu>
	</nav>

	{@render children()}
</div>

<style>
	:global(:root) {
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			Oxygen,
			Ubuntu,
			Cantarell,
			'Open Sans',
			'Helvetica Neue',
			sans-serif;
	}

	:global(html) {
		height: 100%;
	}

	:global(body) {
		margin: 0;
		height: 100%;
	}
	#app {
		min-height: 100%;
	}

	#app[data-dragging='true'] {
		background-color: #f0f8ff;
	}

	menu {
		list-style-type: none;
		margin-block: 0;
		padding-inline-start: 0;
		padding-inline-end: 1.5rem;

		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		gap: 0.5rem;

		justify-content: end;
	}

	a {
		display: inline-block;
		text-decoration: none;
		color: inherit;

		padding-block: 1rem;
		padding-inline: 1rem;
	}

	a:hover,
	a:active {
		text-decoration: underline;
	}
</style>
