<script lang="ts">
    import { page } from '$app/stores';
    import type { Snippet } from 'svelte';
    import { fly } from 'svelte/transition';

    const { href, children, submenu }: { href: string; children: Snippet; submenu?: Snippet } =
        $props();
    const active = $derived($page.url.pathname === href);
    const isParentActive = $derived($page.url.pathname.startsWith(href));
</script>

<li>
    <a
        class="block rounded px-4 py-2 text-gray-800 transition-all hover:bg-gray-100"
        class:active
        class:isParentActive
        {href}
    >
        {@render children()}
    </a>
    {#if submenu && isParentActive}
        <ul class="ml-4" in:fly={{ y: -10 }}>
            {@render submenu()}
        </ul>
    {/if}
</li>

<style>
    .active {
        @apply bg-slate-100;
    }
    .isParentActive {
        @apply font-bold text-cyan-700;
    }
</style>
