<script lang="ts">
	import Heading from '$lib/component/heading.svelte';
	import PublicodesPackages from '$lib/component/publicode-packages.svelte';
	import { Package } from 'lucide-svelte';

	const { data } = $props();
	const packages = data.packages;
</script>

<div class="prose pb-10 lg:max-w-screen-md">
	<Heading level="h1" icon={Package}>Bibliothèque des modèles publiés</Heading>
	<p class="text-xl">Découvrez l'ensemble des paquets publicodes disponibles sur npm.</p>
</div>

<PublicodesPackages {packages} />

<div class="prose max-w-full py-10">
	<p>
		Vous pouvez <strong>réutiliser les calculs</strong> d'un modèle
		<strong>dans votre projet</strong>
		grâce à <a href="./docs/manuel/importer-des-regles">la macro <code>importer!</code></a>.
	</p>
	<p>
		Pour tout savoir sur comment <strong>créer et publier un paquet publicodes</strong>, vous pouvez
		<a href="./docs/guides/model-template">consulter le guide dédié.</a>
	</p>
	<p>
		Si vous souhaitez <strong>ajouter votre paquet publicodes à cette liste</strong>, vous pouvez
		<a
			href="https://github.com/publicodes/publicodes/tree/master/website/src/data/publicodes-packages.ts"
			>proposer une contribution.</a
		>
	</p>
</div>
