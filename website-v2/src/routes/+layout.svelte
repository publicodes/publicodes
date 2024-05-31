<script>
	import favicon from '$lib/assets/favicon-32x32.png';
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
<slot />
