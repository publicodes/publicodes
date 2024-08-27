<script lang="ts">
    import { page } from '$app/stores';
    import type { Snippet } from 'svelte';
    import type { HTMLAnchorAttributes } from 'svelte/elements';

    const { children, href, ...rest }: { href: string; children: Snippet } & HTMLAnchorAttributes =
        $props();

    const active = $derived($page.url.pathname.startsWith(href));
</script>

<li>
    <a {...rest} class="font-light hover:text-primary-400 {rest.class}" class:active {href}>
        {@render children()}
    </a>
</li>

<style>
    .active {
        @apply font-light text-primary-400;
    }
</style>
