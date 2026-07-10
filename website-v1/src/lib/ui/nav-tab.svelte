<script lang="ts">
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	const {
		children,
		href,
		...rest
	}: { href: string; children: Snippet } & HTMLAnchorAttributes = $props();

	const active = $derived($page.url.pathname.startsWith(href));
</script>

<li class={rest.class}>
	<a {...rest} class="font-light hover:text-primary-400" class:active {href}>
		{@render children()}
	</a>
</li>

<style>
	.active {
		@apply font-light text-primary-400;
	}
</style>
