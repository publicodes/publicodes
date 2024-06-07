<script>
	import MenuLink from '$lib/ui/menu-link.svelte';
</script>

<div class="mx-auto mt-12 flex gap-8 align-baseline lg:container">
	<nav class="min-w-64 border-r pr-8">
		<ul>
			<MenuLink href="/docs/introduction">Introduction</MenuLink>

			<MenuLink href="/docs/manuel">
				Manuel
				{#snippet submenu()}
					<MenuLink href="/docs/manuel/mecanismes">Mecanismes</MenuLink>
					<MenuLink href="/docs/manuel/unites">Unités</MenuLink>
					<MenuLink href="/docs/manuel/applicabilite">Applicabilité</MenuLink>
					<MenuLink href="/docs/manuel/espaces-de-nom">Espaces de nom</MenuLink>
					<MenuLink href="/docs/manuel/metadonnees">Métadonnées</MenuLink>
					<MenuLink href="/docs/manuel/remplacement">Remplacement</MenuLink>
					<MenuLink href="/docs/manuel/situation-et-evaluation">Situation et evaluation</MenuLink>
					<MenuLink href="/docs/manuel/compilation">Compilation</MenuLink>
					<MenuLink href="/docs/manuel/importer-des-regles">Importer des règles</MenuLink>
				{/snippet}
			</MenuLink>

			<MenuLink href="/docs/guides">Guides</MenuLink>

			<MenuLink href="/docs/api">API</MenuLink>
		</ul>
	</nav>
	<article class="prose-lg p-8">
		<slot />
	</article>
</div>
