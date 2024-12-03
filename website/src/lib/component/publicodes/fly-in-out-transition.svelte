<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fly } from 'svelte/transition';
	const {
		condition,
		ifTrue,
		ifFalse
	}: {
		condition: boolean;
		ifTrue: Snippet;
		ifFalse: Snippet;
	} = $props();
	const inConf = $derived({ y: 10 * (condition ? 1 : -1), duration: 100 });
	const outConf = $derived({ ...inConf, y: -inConf.y });
</script>

{#if condition}
	<div
		class="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center whitespace-nowrap will-change-transform"
		in:fly={inConf}
		out:fly={outConf}
	>
		{@render ifTrue()}
	</div>
{:else}
	<div
		class="top- absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center whitespace-nowrap will-change-transform"
		in:fly={inConf}
		out:fly={outConf}
	>
		{@render ifFalse()}
	</div>
{/if}
