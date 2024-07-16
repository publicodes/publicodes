<script lang="ts">
    import favicon from '$lib/assets/favicon-32x32.png';
    import Logo from '$lib/assets/logo.svg';
    import PublicodesEditor from '$lib/publicodes/editor.svelte';
    import Callout from '$lib/ui/callout.svelte';
    import NavTab from '$lib/ui/nav-tab.svelte';

    import '../app.css';

    globalThis.PublicodesEditor = PublicodesEditor;
    globalThis.Callout = Callout;
</script>

<svelte:head>
    <title>Publicodes ⋅ Langage pour experts et développeurs</title>

    <meta
        name="description"
        content="Publicodes permet de modéliser des domaines métiers complexes, en les décomposant en règles élémentaires simples qui soient lisibles par tous."
    />

    <link rel="icon" type="image/png" href={favicon} />
</svelte:head>

<div
    class="fixed z-10 flex h-16 w-full items-center justify-center border-b border-primary-200
	bg-white px-8 py-2 text-cyan-950"
>
    <a class="inline-flex items-center gap-2 text-lg font-light hover:text-primary-400" href="/">
        <img src={Logo} class="h-7" alt="Logo de publicodes" />
        Publicodes
    </a>
    <nav class="ml-auto">
        <ul class="flex gap-4">
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
</div>

<div>
    <slot />
    <footer class="flex w-full flex-col items-center border-t border-primary-200 py-10">
        <div class="flex w-full max-w-7xl items-start justify-between">
            <div class="flex flex-col gap-2">
                <span class="inline-flex items-center gap-2 text-xl font-light">
                    <img src={Logo} class="h-7" alt="Logo de publicodes" />
                    Publicodes
                </span>
                <p class="text-lg font-normal text-dark">Collaboratif, accessible et ouvert.</p>
            </div>
            <div class="flex gap-16">
                <div class="flex flex-col gap-2">
                    <p class="font-light text-slate-500">Ressources</p>
                    <ul class="flex flex-col gap-1 font-light">
                        <li>
                            <a href="/about">À propos</a>
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
                            <a href="/statistiques">Statistiques</a>
                        </li>
                        <li>
                            <a href="/docs/faq">FAQ</a>
                        </li>
                    </ul>
                </div>
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
                            <a href="/docs/blog">Blog</a>
                        </li>
                    </ul>
                </div>
            </div>
            <!-- <div class="flex flex-col gap-4"> -->
            <!--     <p class="text-sm text-primary-400">© 2021 Publicodes. Tous droits réservés.</p> -->
            <!--     <p class="text-sm text-primary-400"> -->
            <!--         <a href="/mentions-legales">Mentions légales</a> -->
            <!--     </p> -->
            <!-- </div> -->
        </div>
    </footer>
</div>

<style>
    footer a {
        @apply text-sm hover:text-primary-400;
    }
</style>
