<script lang="ts">
    import 'dayjs/locale/fr';

    import favicon from '$lib/assets/favicon-32x32.png';
    import Logo from '$lib/assets/logo.svg';
    import PublicodesEditor from '$lib/publicodes/editor.svelte';
    import Callout from '$lib/ui/callout.svelte';
    import NavTab from '$lib/ui/nav-tab.svelte';
    import { dayjs } from 'svelte-time';

    import { afterNavigate } from '$app/navigation';
    import { MenuIcon } from 'lucide-svelte';
    import { fly } from 'svelte/transition';
    import '../app.css';

    globalThis.PublicodesEditor = PublicodesEditor;
    globalThis.Callout = Callout;

    const { children } = $props();

    // Set the locale time to French
    dayjs.locale('fr');

    let showMobileMenu = $state(false);
    afterNavigate(() => {
        showMobileMenu = false;
    });
</script>

<svelte:head>
    <title>Publicodes ⋅ Langage pour expert·es et développeur·euses</title>

    <meta
        name="description"
        content="Publicodes permet de modéliser des domaines métiers complexes,
		en les décomposant en règles élémentaires simples qui soient
		lisibles par tout le monde."
    />

    <link rel="icon" type="image/png" href={favicon} />
</svelte:head>

<!-- FIXME: there is an issue with the documentation width in the mobile view -->
<div
    class="fixed top-0 z-10 flex h-16 w-screen items-center justify-between border-b border-primary-200 bg-white
	px-6 py-2 text-cyan-950 md:px-8"
>
    <a class="inline-flex items-center gap-2 text-xl font-light hover:text-primary-400" href="/">
        <img src={Logo} class="h-7" alt="Logo de publicodes" />
        Publicodes
    </a>

    <button
        class="text-primary-400 hover:text-primary-600 sm:hidden"
        onclick={() => (showMobileMenu = true)}
    >
        <MenuIcon size={24} />
    </button>

    <div class="hidden sm:block">
        {@render Menu()}
    </div>
</div>

{#snippet Menu()}
    <nav class="p-6 sm:p-0">
        <ul class="flex flex-col items-start justify-center gap-4 sm:flex-row sm:items-center">
            <NavTab href="/docs">Documentation</NavTab>
            <NavTab href="/studio">Studio</NavTab>
            <NavTab href="/blog">Blog</NavTab>
            <!-- <NavTab href="/blog">Blog</NavTab> -->
            <!-- <li>
                <a
                    class="hover:underline"
                    href="https://app.element.io/#/room/#publicodes:matrix.org">Communauté</a
                >
            </li>
            <li>
                <a class="hover:underline" href="https://github.com/publicodes/publicodes">Github</a
                >
            </li> -->
        </ul>
    </nav>
{/snippet}

{#if showMobileMenu}
    <div
        role="dialog"
        class="fixed right-0 top-0 z-40 h-full border-l
        border-primary-300 bg-white will-change-transform sm:hidden"
        transition:fly={{ x: 100 }}
    >
        {@render Menu()}
    </div>
    <div
        class="fixed inset-0 z-40 sm:hidden"
        aria-hidden="true"
        onclick={() => (showMobileMenu = false)}
    ></div>
{/if}
<div class="max-h-full pt-16" class:blur-sm={showMobileMenu} class:opacity-50={showMobileMenu}>
    {@render children()}
    <footer class="flex w-full flex-col items-center border-t border-primary-200 py-10">
        <div
            class="flex w-full flex-col items-start gap-8 px-6 md:max-w-7xl md:flex-row md:justify-between"
        >
            <div class="flex flex-col gap-2">
                <span class="inline-flex items-center gap-2 text-2xl font-light">
                    <img src={Logo} class="h-7" alt="Logo de publicodes" />
                    Publicodes
                </span>
                <p class="text-lg font-normal text-dark">Collaboratif, accessible et ouvert.</p>
            </div>
            <div class="flex flex-row gap-16">
                <!-- <div class="flex flex-col gap-2">
                    <p class="font-light text-slate-500">Ressources</p>
                    <ul class="flex flex-col gap-1 font-light">
                        <li>
                            <a href="/docs">À propos</a>
                        </li>
                        <li>
                            <a href="/docs">Documentation</a>
                        </li>
                        <li>
                            <a href="/docs">Bibliothèque</a>
                        </li>
                        <li>
                            <a href="/docs">Réalisations</a>
                        </li>
                        <li>
                            <a href="/docs">Statistiques</a>
                        </li>
                        <li>
                            <a href="/docs">FAQ</a>
                        </li>
                    </ul>
                </div> -->
                <div class="flex flex-col gap-2">
                    <p class="font-light text-slate-500">Communauté</p>
                    <ul class="flex flex-col gap-1 font-light">
                        <li>
                            <a href="https://matrix.to/#/#publicodes:matrix.org">Matrix</a>
                        </li>
                        <li>
                            <a href="https://github.com/publicodes" target="_blank">GitHub</a>
                        </li>
                        <li>
                            <a href="/blog">Blog</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>
</div>

<style>
    footer a {
        @apply text-sm hover:text-primary-400;
    }
</style>
