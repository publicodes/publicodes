<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import MenuLink from '$lib/ui/menu-link.svelte';
    import type { Snippet } from 'svelte';
    import { fly } from 'svelte/transition';
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
    let showMobileMenuLeft = $state(false);
    let showMobileMenuRight = $state(false);
    afterNavigate(() => {
        showMobileMenuLeft = false;
        showMobileMenuRight = false;
    });
    // class="prose  mx-auto mt-8 max-w-none flex-1 flex-shrink p-8 xl:max-w-screen-md"
</script>

{#snippet MenuLeft()}
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
{/snippet}

{#snippet MenuRight()}
    {#if currentPageMetadata.headings.length}
        <div class="mx-2">
            <h2 class="not-prose my-2 p-2 uppercase text-slate-500">Sur cette page</h2>
            <ul>
                {#each currentPageMetadata.headings as { title, slug }}
                    <li class="p-2">
                        <a href={`#${slug}`}>{title}</a>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
{/snippet}

<div class="flex max-h-full items-start">
    <!-- MOBILE NAV -->
    {#if showMobileMenuLeft}
        <nav
            class="fixed z-20 h-full overflow-auto border-r bg-white will-change-transform"
            transition:fly={{ x: -100 }}
        >
            {@render MenuLeft()}
        </nav>
        <div class="fixed inset-0 z-10" onclick={() => (showMobileMenuLeft = false)}></div>
    {/if}

    <nav class="sticky top-16 min-w-72 pr-4 max-md:hidden">{@render MenuLeft()}</nav>
    <div class="self-stretch border-r"></div>
    <div
        class="mx-auto flex flex-1 flex-col px-4 pt-8 transition-all 2xl:prose-lg max-md:max-w-full md:px-8 xl:max-w-screen-md 2xl:max-w-4xl"
    >
        <div class="mb-4 flex justify-between gap-2">
            <button
                class="self flex gap-2 rounded-md border px-4 py-2 text-primary-700 hover:bg-slate-100 md:hidden"
                onclick={() => (showMobileMenuLeft = true)}
            >
                <svg
                    class="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h16m-7 6h7"
                    ></path>
                </svg>Menu
            </button>

            <button
                class="flex rounded-md border px-4 py-2 text-primary-700 hover:bg-slate-100 lg:hidden"
                onclick={() => (showMobileMenuRight = true)}
            >
                <span>Sur cette page</span>
            </button>
        </div>
        <article
            class:blur-sm={showMobileMenuLeft || showMobileMenuRight}
            class:opacity-50={showMobileMenuLeft || showMobileMenuRight}
            class="prose py-8"
        >
            <h1>{currentPageMetadata.title}</h1>
            {@render children()}
        </article>
    </div>

    {#if showMobileMenuRight}
        <nav
            onclick={() => (showMobileMenuRight = false)}
            class="fixed right-0 z-20 h-full overflow-auto border-l bg-white will-change-transform"
            transition:fly={{ x: 100 }}
        >
            {@render MenuRight()}
        </nav>
        <div class="fixed inset-0 z-10" onclick={() => (showMobileMenuRight = false)}></div>
    {/if}

    <nav class="sticky top-16 max-h-screen w-64 overflow-auto pt-16 text-sm max-lg:hidden">
        {@render MenuRight()}
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
