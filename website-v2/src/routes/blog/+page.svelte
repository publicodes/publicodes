<script lang="ts">
    import type { Page } from '$lib/utils/get-markdown-page-info';
    import { Newspaper, Rss } from 'lucide-svelte';
    import type { Metadata } from './+page.server';

    import PostCard from './post-card.svelte';
    import PostListItem from './post-list-item.svelte';

    const { data }: { data: { blogPosts: Array<Page<Metadata>> } } = $props();
    const featuredPosts = data.blogPosts.filter((post) => post.metadata.featured);

    // TODO: factorize icon size et width with other components
    const iconSize = 36;
    const iconStrokeWidth = 1;
</script>

<div class="flex w-full flex-col">
    <section class="flex w-full flex-col items-center gap-16 bg-primary-50">
        <div
            class="not-prose flex w-full max-w-3xl flex-col justify-center
			gap-10 px-6 py-20 lg:max-w-5xl lg:py-24 xl:max-w-7xl"
        >
            <div class="flex gap-4">
                <Rss class="hidden md:block" size={iconSize} strokeWidth={iconStrokeWidth} />
                <h2 class="m-0 text-3xl font-normal md:text-4xl">Les derniers articles</h2>
            </div>
            <ul class="grid gap-5 lg:grid-cols-2">
                {#each featuredPosts as { path, metadata: { title, description, date, tags } }}
                    <PostCard url={'blog' + path} {title} {description} {date} {tags} />
                {/each}
            </ul>
        </div>
    </section>
    <section class="flex w-full flex-col items-center gap-16">
        <div
            class="not-prose flex w-full flex-col justify-center px-6
			py-20 md:max-w-3xl md:py-24 lg:max-w-5xl xl:max-w-7xl"
        >
            <div class="flex gap-4">
                <Newspaper class="hidden md:block" size={iconSize} strokeWidth={iconStrokeWidth} />
                <h2 class="m-0 text-3xl font-normal md:text-4xl">Tous les articles</h2>
            </div>
            <ul class="not-prose divide-y divide-primary-100">
                {#each data.blogPosts as { path, metadata: { title, description, tags } }}
                    <PostListItem url={'blog' + path} {title} {description} {tags} />
                {/each}
            </ul>
        </div>
    </section>
</div>
