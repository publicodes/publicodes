<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import MenuLink from '$lib/ui/menu-link.svelte';
    import { fly } from 'svelte/transition';

    const { children, data } = $props();
    const { title, description, headings, menuEntries } = data;

    function getChildPage(path: string) {
        return menuEntries
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
    const entryPages = getChildPage('/docs');
    let showMobileMenuLeft = $state(false);
    let showMobileMenuRight = $state(false);
    afterNavigate(() => {
        showMobileMenuRight = false;
    });
</script>

<svelte:head>
    <title>{title} - Publicodes</title>
    {#if description}
        <meta name="description" content={description} />
    {/if}
</svelte:head>
<div class="flex min-h-full items-start lg:justify-center">
    <div class="flex lg:container">
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

        <div class="sticky top-16 max-h-screen max-md:hidden">
            {@render MenuLeft()}
        </div>
        <div class="self-stretch border-r border-primary-100"></div>
        <div
            class="prose mx-auto flex flex-col px-4 pt-8 transition-all xl:prose-lg max-md:max-w-full md:px-8 2xl:max-w-4xl"
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
                class=" py-8"
            >
                <h1>{title}</h1>
                {@render children()}
            </article>
        </div>

        {#if showMobileMenuRight}
            <div
                role="dialog"
                class="fixed right-0 z-20 h-full overflow-auto border-l border-primary-300 bg-white will-change-transform"
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

        <div class="sticky top-16 hidden max-h-screen w-64 overflow-auto pt-16 text-sm lg:block">
            {@render MenuRight()}
        </div>
    </div>
</div>

{#snippet MenuLeft()}
    <nav class="w-60">
        <ul>
            {#each entryPages as { path, metadata }}
                {@const childPages = getChildPage(path)}
                <MenuLink
                    href={path}
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
                            <MenuLink href={childPath} onclick={() => (showMobileMenuLeft = false)}>
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
    {#if headings?.length}
        <nav class="mx-2 border-primary-50" class:md:border-l={!showMobileMenuRight}>
            <h2 class="not-prose my-2 p-2 uppercase text-slate-500">Sur cette page</h2>
            <ul>
                {#each headings as { title, slug }}
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

<style>
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
