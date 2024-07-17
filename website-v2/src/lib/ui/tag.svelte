<script lang="ts">
    import type { Snippet } from 'svelte';
    const {
        bgColor = 'bg-slate-500',
        size = 'md',
        children
    }: {
        bgColor?: string;
        children: Snippet;
        size?: 'md' | 'lg';
    } = $props();
</script>

<div
    class={'h-fit break-keep rounded px-2 py-1 font-medium text-slate-700 will-change-transform ' +
        bgColor}
    class:px-3={size === 'lg'}
    class:py-2={size === 'lg'}
    class:text-sm={size === 'md'}
>
    {@render children()}
</div>
