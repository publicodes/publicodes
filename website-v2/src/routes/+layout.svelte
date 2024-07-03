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

<div class="fixed z-10 flex h-16 w-full items-center border-b bg-white p-4 text-cyan-950">
    <a class="inline-flex items-center gap-2 text-lg font-bold" href="/">
        <img src={Logo} class="h-8" alt="Logo de publicodes" />
        Publicodes
    </a>
    <nav class="ml-auto">
        <ul class="flex gap-4">
            <NavTab href="/docs">Docs</NavTab>
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
<div
    class="max-h-full pt-16 prose-h1:text-primary-950 prose-h2:font-bold prose-h2:text-primary-950 prose-h3:text-primary-950 prose-a:text-primary-900 hover:prose-a:text-primary-700 prose-blockquote:rounded-l-sm prose-blockquote:bg-slate-100 prose-blockquote:px-4 prose-blockquote:py-2
    prose-blockquote:font-normal prose-blockquote:not-italic prose-code:rounded prose-code:border prose-code:border-slate-200 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5"
>
    <slot />
</div>
