<script lang="ts">
	import { page } from '$app/stores';
	import { ChevronRight } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	const {
		href,
		children,
		isSection = false,
		submenu,
		onclick
	}: {
		href: string;
		children: Snippet;
		isSection?: boolean;
		submenu?: Snippet;
		onclick?: () => void;
	} = $props();

	const active = $derived($page.url.pathname === href);
	const isParentActive = $derived($page.url.pathname.startsWith(href));
	const isParentActiveWithSubmenu = $derived(isParentActive && isSection);
</script>

<li class:section={submenu}>
	<a
		class="not-prose block px-4 py-2 text-dark hover:text-primary-400"
		class:active
		class:isParentActive
		class:isParentActiveWithSubmenu
		{href}
		{onclick}>
		<span class="flex items-center justify-between gap-2">
			{@render children()}
			{#if isSection}
				<ChevronRight
					size={24}
					strokeWidth={1}
					class={'transition-transform ' +
						(isParentActive ? 'rotate-90' : '')} />
			{/if}
		</span>
	</a>
	{#if submenu && isParentActive}
		<ul class="bg-primary-50 bg-opacity-15 pl-2 font-light" transition:slide>
			{@render submenu()}
		</ul>
	{/if}
</li>

<style>
	a {
		transition: background-color 0.2s;
	}
	.active {
		@apply text-primary-400;
	}
	.isParentActive {
		@apply text-primary-400;
	}
	.isParentActiveWithSubmenu {
		@apply bg-primary-50;
	}
	.section {
		@apply border-b border-primary-50;
	}
</style>
