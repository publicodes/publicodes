<script lang="ts">
    import { POSTS_LIST } from './content';

    import PostCard from './post-card.svelte';
    import PostListItem from './post-list-item.svelte';

    const featuredPosts = POSTS_LIST.filter((post) => post.isFeatured);
    const posts = POSTS_LIST;
</script>

<div class="container mx-auto mt-12 p-8">
    <div>
        <h1 class="text-2xl font-bold sm:text-4xl">Blog</h1>
        <h2 class="mt-8 text-xl font-bold sm:text-2xl">Les derniers articles</h2>
        <div class="mx-auto mt-8 grid max-w-lg gap-5 lg:max-w-none lg:grid-cols-3">
            {#each featuredPosts as { url, title, description, date, tags, icon }}
                <PostCard {url} {title} {description} {date} {tags} {icon} />
            {/each}
        </div>

        <!-- Lists -->
        <h2 class="mt-8 text-xl font-bold sm:text-2xl">Tous les articles</h2>
        <ul class="divide-y divide-gray-200">
            {#each posts as { url, title, description, tags }}
                <PostListItem {url} {title} {description} {tags} />
            {/each}
        </ul>
    </div>
</div>
