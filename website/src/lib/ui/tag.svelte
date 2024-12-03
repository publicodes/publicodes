<script lang="ts">
	import type { Snippet } from 'svelte';
	const {
		class: className = 'bg-primary-600 text-white ',
		size = 'md',
		children
	}: {
		class?: string;
		children: Snippet;
		size?: 'md' | 'lg';
	} = $props();
</script>

<span
	class={'h-fit break-keep rounded px-2 py-1 text-slate-800 will-change-transform ' + className}
	class:px-3={size === 'lg'}
	class:py-2={size === 'lg'}
	class:text-sm={size === 'md'}
>
	{@render children()}
</span>
