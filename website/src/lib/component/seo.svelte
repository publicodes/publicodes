<script lang="ts">
	import { page } from '$app/state';

	const publicodesTagline =
		'Publicodes est un langage pour l’écriture d’algorithmes d’intérêt général grâce à des règles ouvertes et compréhensibles.';

	let {
		title = undefined,
		subTitle = undefined,
		description = undefined,
		image = '/og-images/index.png',
		type = 'website'
	}: {
		title?: string;
		subTitle?: string;
		description?: string;
		image?: string;
		type?: 'website' | 'article';
	} = $props();

	title =
		title !== undefined
			? `${title} | ${subTitle !== undefined ? subTitle + ' Publicodes' : 'Publicodes'}`
			: 'Publicodes';

	description =
		description !== undefined
			? `${description}${description.endsWith('.') ? '' : '.'} ${publicodesTagline}`
			: publicodesTagline;
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:site_name" content="Publicodes" />
	<meta
		property="og:url"
		content="https://www.example.com{page.url.pathname.toString()}" />
	<meta property="og:type" content={type} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	<meta property="og:locale" content="fr_FR" />

	<meta property="twitter:domain" content="publi.codes" />
	<meta
		property="twitter:url"
		content="https://publi.codes{page.url.pathname.toString()}" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />

	{@html `  <script type="application/ld+json">{
   "@context": "https://schema.org",
   "@type": "Website",
   "name": "${title}",
   "url": "https//www.publi.codes${page.url.pathname}",
   "logo": ${image}  }</script>`}
</svelte:head>
