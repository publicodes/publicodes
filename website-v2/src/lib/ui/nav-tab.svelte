<script lang="ts">
    import { page } from '$app/stores';
    import type { Snippet } from 'svelte';

    const { href, children }: { href: string; children: Snippet } = $props();

    const active = $derived($page.url.pathname === href);
</script>

<li>
    <a class="hover:underline" {href} class:active>
        {@render children()}
    </a>
</li>

<style>
    .active {
        @apply font-bold;
    }
</style>
