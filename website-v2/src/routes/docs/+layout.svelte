<script lang="ts">
    import { page } from '$app/stores';
    import MenuLink from '$lib/ui/menu-link.svelte';
    import type { Snippet } from 'svelte';
    import Page from '../+page.svelte';
    type Props = {
        children: Snippet;
        data: {
            docPages: Array<Page>;
        };
    };
    const { children, data }: Props = $props();
    function getChildPage(slug: string) {
        return data.docPages
            .filter((page) => {
                return (
                    page.slug.startsWith(slug) &&
                    page.slug !== slug &&
                    page.slug.split('/').length === slug.split('/').length + 1
                );
            })
            .sort(
                (b, a) =>
                    (b.metadata.sidebar_position as number) -
                    (a.metadata.sidebar_position as number)
            );
    }

    const entryPages = getChildPage('');
    const currentPageMetadata = $derived(
        data.docPages.find((page) => `/docs${page.slug}` === $page.url.pathname)?.metadata
    );

    // class="prose  mx-auto mt-8 max-w-none flex-1 flex-shrink p-8 xl:max-w-screen-md"
</script>

<div class="flex max-h-full items-start">
    <nav class="sticky top-16 min-w-72 pr-4">
        <ul>
            {#each entryPages as { slug, metadata }}
                <MenuLink href={`/docs${slug}`}>
                    {metadata.menu_title || metadata.title}
                    {#snippet submenu()}
                        {#each getChildPage(slug) as { slug: childSlug, metadata }}
                            <MenuLink href={`/docs${childSlug}`}>
                                {metadata.menu_title || metadata.title}
                            </MenuLink>
                        {/each}
                    {/snippet}
                </MenuLink>
            {/each}
        </ul>
    </nav>
    <article
        class="prose 2xl:prose-lg mx-auto max-w-screen-sm border-l px-8 py-16 xl:max-w-screen-md 2xl:max-w-4xl"
    >
        <h1>{currentPageMetadata.title}</h1>
        {@render children()}
    </article>
    <nav class="sticky top-16 max-h-screen w-64 overflow-auto pt-16 text-sm">
        {#if currentPageMetadata.headings.length}
            <h2 class="not-prose my-2 p-2 uppercase text-slate-500">Sur cette page :</h2>
            <ul>
                {#each currentPageMetadata.headings as { title, slug }}
                    <li class="p-2">
                        <a href={`#${slug}`}>{title}</a>
                    </li>
                {/each}
            </ul>
        {/if}
    </nav>
</div>

<style>
    :global(.editor-container) {
        @apply mb-8;
    }
    :global(h2:hover .icon.icon-link::before),
    :global(h3:hover .icon.icon-link::before),
    :global(h4:hover .icon.icon-link::before),
    :global(h5:hover .icon.icon-link::before) {
        @apply opacity-100;
    }

    article {
        & :global(h2),
        & :global(h3),
        & :global(h4),
        & :global(h5) {
            scroll-margin-top: 6rem;
        }
    }

    :global(.icon.icon-link::before) {
        content: '#';
        @apply -ml-5 -mr-5 pr-5 opacity-0 transition-opacity;
    }
</style>
