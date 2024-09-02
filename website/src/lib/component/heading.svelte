<script lang="ts">
    import type { Component } from 'lucide-svelte';
    import type { Snippet } from 'svelte';

    type Props = {
        icon?: typeof Component;
        level?: 'h1' | 'h2';
        children: Snippet;
    };

    const { icon: Icon, level, children }: Props = $props();
</script>

<div class="flex gap-2 md:gap-4">
    {#if Icon}
        <Icon class="hidden sm:block" size={36} strokeWidth={1}></Icon>
    {/if}
    {#if level === 'h1'}
        <h1 class="m-0 text-3xl font-normal md:text-4xl">{@render children()}</h1>
    {:else}
        <h2 class="m-0 text-3xl font-normal md:text-4xl">{@render children()}</h2>
    {/if}
</div>
