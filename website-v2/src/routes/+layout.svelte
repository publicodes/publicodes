<script>
    import favicon from '$lib/assets/favicon-32x32.png';
    import Logo from '$lib/assets/logo.svg';
    import NavTab from '$lib/ui/nav-tab.svelte';
    import '../app.css';
</script>

<svelte:head>
    <title>Publicodes ⋅ Langage pour experts et développeurs</title>

    <meta
        name="description"
        content="Publicodes permet de modéliser des domaines métiers complexes, en les décomposant en règles élémentaires simples qui soient lisibles par tous."
    />

    <link rel="icon" type="image/png" href={favicon} />
</svelte:head>

<div class="flex h-full flex-col">
    <div class="flex items-center p-4 text-cyan-950">
        <a class="inline-flex items-center gap-2 text-lg font-bold" href="/">
            <img src={Logo} class="h-8" alt="Logo de publicodes" />
            Publicodes
        </a>
        <nav class="ml-auto">
            <ul class="flex gap-4">
                <NavTab href="/studio">Studio</NavTab>
                <NavTab href="/docs">Docs</NavTab>
                <NavTab href="/bliliotheques">Bibliothèques</NavTab>
                <NavTab href="/blog">Blog</NavTab>
                <NavTab href="/tutoriel">Tutoriel</NavTab>
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
        class="prose-h2:text-primary-950 prose-strong:text-primary-700 flex flex-1 flex-col prose-h2:font-bold"
    >
        <slot />
    </div>
</div>
