<script lang="ts">
    import type { Snippet } from 'svelte';

    const {
        light = false,
        children,
        ...rest
    }: {
        light?: boolean;
        children: Snippet;
    } = $props();
</script>

<span
    {...rest}
    class="border-1 font-lg inline-block cursor-pointer rounded border border-white px-4 py-2 font-sans font-semibold text-white transition duration-100 ease-in-out hover:bg-slate-300 hover:bg-opacity-15"
    class:background={!light}
>
    {@render children()}
</span>

<style>
    .background {
        @apply bg-primary-700 hover:bg-primary-600;
    }
</style>
