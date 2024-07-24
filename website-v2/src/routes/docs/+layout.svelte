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
    const currentPage = $derived($page);

    function getChildPage(path: string) {
        return data.docPages
            .filter((page) => {
                return (
                    page.path.startsWith(path) &&
                    page.path !== path &&
                    page.path.split('/').length === path.split('/').length + 1
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
        data.docPages.find((page) => `/docs${page.path}` === currentPage.url.pathname)?.metadata
    );
    let showMobileMenuLeft = $state(false);
    let showMobileMenuRight = $state(false);
    afterNavigate(() => {
        showMobileMenuRight = false;
    });
</script>

{#snippet MenuLeft()}
    <nav>
        <ul>
            {#each entryPages as { path, metadata }}
                {@const childPages = getChildPage(path)}
                <MenuLink
                    href={`/docs${path}`}
                    onclick={() => {
                        if (childPages.length) {
                            return;
                        }
                        showMobileMenuLeft = false;
                    }}
                    isSection={childPages.length > 0}
                >
                    {metadata.menu_title || metadata.title}
                    {#snippet submenu()}
                        {#each childPages as { path: childPath, metadata }}
                            <MenuLink
                                href={`/docs${childPath}`}
                                onclick={() => (showMobileMenuLeft = false)}
                            >
                                {metadata.menu_title || metadata.title}
                            </MenuLink>
                        {/each}
                    {/snippet}
                </MenuLink>
            {/each}
        </ul>
    </nav>
{/snippet}

{#snippet MenuRight()}
    {#if currentPageMetadata.headings.length}
        <nav class="mx-2 border-primary-50" class:md:border-l={!showMobileMenuRight}>
            <h2 class="not-prose my-2 p-2 uppercase text-slate-500">Sur cette page</h2>
            <ul>
                {#each currentPageMetadata.headings as { title, slug }}
                    <li class="p-2">
                        <a
                            class="font-regular text-slate-700 hover:text-primary-400"
                            href={`#${slug}`}
                            onclick={() => (showMobileMenuRight = false)}>{title}</a
                        >
                    </li>
                {/each}
            </ul>
        </nav>
    {/if}
{/snippet}

<div class="flex items-start">
    <!-- MOBILE NAV -->
    {#if showMobileMenuLeft}
        <div
            role="dialog"
            class="fixed z-20 h-full overflow-auto border-r border-primary-300 bg-white will-change-transform"
            transition:fly={{ x: -100 }}
        >
            {@render MenuLeft()}
        </div>
        <div
            class="fixed inset-0 z-10"
            aria-hidden="true"
            onclick={() => (showMobileMenuLeft = false)}
        ></div>
    {/if}

    <div class="sticky top-16 min-h-max w-60 max-md:hidden">
        {@render MenuLeft()}
    </div>
    <div class="self-stretch border-r border-primary-100"></div>
    <div
        class="mx-auto flex flex-1 flex-col px-4 pt-8 transition-all 2xl:prose-lg max-md:max-w-full md:px-8 xl:max-w-screen-md 2xl:max-w-4xl"
    >
        <div class="flex justify-between gap-2">
            <button
                class="self flex gap-2 rounded-sm border border-primary-300 px-4
				py-2 text-primary-400 hover:bg-slate-100 md:hidden"
                onclick={() => (showMobileMenuLeft = true)}
            >
                Menu
            </button>

            <button
                class="flex rounded-sm border border-primary-300 px-4 py-2
				text-primary-400 hover:bg-slate-100 lg:hidden"
                onclick={() => (showMobileMenuRight = true)}
            >
                <span>Sur cette page</span>
            </button>
        </div>
        <article
            class:blur-sm={showMobileMenuLeft || showMobileMenuRight}
            class:opacity-50={showMobileMenuLeft || showMobileMenuRight}
            class="prose py-8 lg:prose-lg"
        >
            <h1>{currentPageMetadata.title}</h1>
            {@render children()}
        </article>
    </div>

    {#if showMobileMenuRight}
        <div
            role="dialog"
            class="fixed right-0 z-20 h-full overflow-auto border-l
			border-primary-300 bg-white will-change-transform"
            transition:fly={{ x: 100 }}
        >
            {@render MenuRight()}
        </div>
        <div
            class="fixed inset-0 z-10"
            aria-hidden="true"
            onclick={() => (showMobileMenuRight = false)}
        ></div>
    {/if}

    <div
        class="sticky top-16 hidden max-h-screen w-64 overflow-auto pt-16
		text-sm lg:block"
    >
        {@render MenuRight()}
    </div>
</div>

<style>
    :global(.editor-container) {
        /* NOTE: this was an issue with the studio */
        /* @apply mb-8; */
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
