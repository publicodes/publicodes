<script lang="ts">
    import type { Page } from '$lib/utils/get-markdown-page-info';
    import type { Metadata } from './+page.server';

    import PostCard from './post-card.svelte';
    import PostListItem from './post-list-item.svelte';

    const { data }: { data: { blogPosts: Array<Page<Metadata>> } } = $props();
    const featuredPosts = data.blogPosts.filter((post) => post.metadata.featured);
</script>

<div>
    <h1 class="text-2xl font-bold sm:text-4xl">Blog</h1>
    <h2 class="mt-8 text-xl font-bold sm:text-2xl">Les derniers articles</h2>
    <div class="prose-lg mt-8 grid max-w-lg gap-5 lg:max-w-none lg:grid-cols-3">
        {#each featuredPosts as { path, metadata: { title, description, date, tags, icon } }}
            <PostCard url={'blog' + path} {title} {description} {date} {tags} {icon} />
        {/each}
    </div>

    <!-- Lists -->
    <h2 class="mt-8 text-xl font-bold sm:text-2xl">Tous les articles</h2>
    <ul class="divide-y divide-gray-200">
        {#each data.blogPosts as { path, metadata: { title, description, tags } }}
            <PostListItem url={'blog' + path} {title} {description} {tags} />
        {/each}
    </ul>
</div>
