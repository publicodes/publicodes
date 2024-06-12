<script>
    import favicon from '$lib/assets/favicon-32x32.png';
    import Logo from '$lib/assets/logo.svg';
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
                <li><a class="hover:underline" href="/studio">Studio</a></li>
                <li><a class="hover:underline" href="/docs">Docs</a></li>
                <li><a class="hover:underline" href="/bliliotheques">Bibliothèques</a></li>
                <li><a class="hover:underline" href="/blog">Blog</a></li>
                <li><a class="hover:underline" href="/tutoriel">Tutoriel</a></li>
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
        class="flex flex-1 flex-col prose-h2:font-bold prose-h2:text-sky-950 prose-strong:text-sky-700"
    >
        <slot />
    </div>
</div>
