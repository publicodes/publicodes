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
            class="not-prose flex w-full max-w-3xl flex-col justify-center gap-10 py-24 lg:max-w-5xl xl:max-w-7xl"
        >
            <div class="flex gap-4">
                <Rss size={iconSize} strokeWidth={iconStrokeWidth} />
                <h2 class="m-0 text-4xl font-normal">Les derniers articles</h2>
            </div>
            <ul class="grid gap-5 lg:grid-cols-2">
                {#each featuredPosts as { path, metadata: { title, description, date, tags, icon } }}
                    <PostCard url={'blog' + path} {title} {description} {date} {tags} {icon} />
                {/each}
            </ul>
        </div>
    </section>
    <section class="flex w-full flex-col items-center gap-16">
        <div
            class="not-prose flex w-full max-w-3xl flex-col justify-center py-24 lg:max-w-5xl xl:max-w-7xl"
        >
            <div class="flex gap-4">
                <Newspaper size={iconSize} strokeWidth={iconStrokeWidth} />
                <h2 class="m-0 text-4xl font-normal">Tous articles</h2>
            </div>
            <ul class="not-prose divide-y divide-primary-100">
                {#each data.blogPosts as { path, metadata: { title, description, tags } }}
                    <PostListItem url={'blog' + path} {title} {description} {tags} />
                {/each}
            </ul>
        </div>
    </section>
</div>
