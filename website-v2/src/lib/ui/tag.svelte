<script lang="ts">
    import type { Snippet } from 'svelte';
    const {
        children
    }: {
        children: Snippet;
    } = $props();
</script>

<div class="rounded-full bg-primary-600 px-3 py-1 text-sm text-white will-change-transform">
    {@render children()}
</div>
