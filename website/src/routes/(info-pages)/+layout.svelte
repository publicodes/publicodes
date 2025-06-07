<script context="module">
	import { page } from '$app/state';

	const pageTitle = 'Publicodes';
	const pageDescription =
		"Un langage pour l’écriture d’algorithmes d'intérêt général grâce à des règles ouvertes et compréhensibles.";
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@docsearch/css@3" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="/og-images/index.png" />
	<meta property="og:image:alt" content={pageDescription} />
	<meta property="og:url" content={page.url.href} />
</svelte:head>

<main class="container mx-auto px-8 pt-12">
	<slot></slot>
</main>
