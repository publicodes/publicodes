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
        class="not-prose block rounded px-4 py-2 text-primary-950 hover:bg-slate-100 hover:underline 2xl:px-6 2xl:py-3 2xl:text-lg"
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
    a {
        transition: background-color 0.2s;
    }
    .active {
        @apply bg-slate-100;
    }
    .isParentActive {
        @apply font-bold text-primary-700;
    }
</style>
