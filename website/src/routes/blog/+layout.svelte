<script>
    import { blogVisited } from '$lib/model/new-blog-post-indicator.svelte';
    import { onMount } from 'svelte';
    onMount(() => blogVisited());
</script>

<article class="flex flex-col">
    <slot></slot>
</article>
