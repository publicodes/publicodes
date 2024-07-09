<script lang="ts">
    import { page } from '$app/stores';
    import type { Snippet } from 'svelte';

    const { href, children }: { href: string; children: Snippet } = $props();

    const active = $derived($page.url.pathname.startsWith(href));
</script>

<li>
    <a class="font-light hover:text-primary-400" {href} class:active>
        {@render children()}
    </a>
</li>

<style>
    .active {
        @apply font-light text-primary-400;
    }
</style>
