<script lang="ts">
	import highlight from './highlight';

	const { code, title = 'Publicodes' }: { code: string; title: string } = $props();

	const html = highlight(code);
</script>

<div class="editor rounded-lg bg-sky-600">
	<div class="text-bold w-full p-4 font-bold text-blue-50">{title}</div>
	{#await html}
		<pre><code>{code}</code></pre>
	{:then highlightedCode}
		{@html highlightedCode}
	{/await}
</div>

<style>
	.editor :global(pre) {
		@apply bg-sky-100 p-4 pb-4;
	}
</style>
