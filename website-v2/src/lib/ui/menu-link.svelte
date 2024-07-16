<script lang="ts">
    import { page } from '$app/stores';
    import type { Snippet } from 'svelte';
    import { fly } from 'svelte/transition';

    const {
        href,
        children,
        submenu,
        onclick
    }: { href: string; children: Snippet; submenu?: Snippet; onclick?: () => void } = $props();
    const active = $derived($page.url.pathname === href);
    const isParentActive = $derived($page.url.pathname.startsWith(href));
    const isParentActiveWithSubmenu = $derived(isParentActive && submenu);
    const section = submenu;
</script>

<li class:section>
    <a
        class="not-prose block px-4 py-2 text-dark hover:text-primary-400"
        class:active
        class:isParentActive
        class:isParentActiveWithSubmenu
        {href}
        {onclick}
    >
        {@render children()}
    </a>
    {#if submenu && isParentActive}
        <ul class="font-light">
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
