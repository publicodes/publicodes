<script lang="ts">
	import {
		ArrowRight,
		CodeXmlIcon,
		LandmarkIcon,
		LibraryBig,
		Microscope,
		Play,
		Rocket
	} from 'lucide-svelte';

	import { produits, type Produit } from '$data/produits';
	import PublicodesSchemaSVG from '$lib/assets/publicodes-schema.svg';
	import AnimatedLogo from '$lib/component/animated-logo.svelte';
	import Heading from '$lib/component/heading.svelte';
	import PublicodesPackages from '$lib/component/publicode-packages.svelte';
	import PublicodesEditor from '$lib/component/publicodes/editor.svelte';
	import Banner from '$lib/ui/banner.svelte';
	import Button from '$lib/ui/button.svelte';
	import Callout from '$lib/ui/callout.svelte';
	import Card from '$lib/ui/card.svelte';
	import { fly } from 'svelte/transition';

	const { data } = $props();
	const packages = data.packages;

	const isMobile = false; //window.innerWidth < 768;

	const displayedProduits = produits
		.filter(({ img }) => !!img)
		.slice(0, 3) as (Produit & {
		img: string;
	})[];

	let showDoc = $state(false);

	function showDocOnSuccess(code: string) {
		if (!showDoc && code.includes('salaire brut: 3000 €/mois')) {
			setTimeout(() => {
				showDoc = true;
			}, 500);
		}
	}
</script>

<header
	class="not-prose flex w-full justify-center overflow-hidden bg-primary-50">
	<div
		class="flex max-w-3xl items-center justify-center px-6 py-20 md:flex-row md:gap-12
		md:py-48 lg:max-w-5xl xl:max-w-7xl xl:gap-24">
		<div
			class="hidden justify-center self-center max-sm:scale-75 md:flex xl:scale-125">
			<AnimatedLogo />
		</div>
		<div class="flex flex-col gap-8 lg:gap-8">
			<h1 class="text-5xl font-normal text-dark md:text-6xl xl:text-7xl">
				Publicodes
			</h1>
			<p class="mb-4 text-2xl font-normal text-dark md:text-3xl lg:text-4xl">
				Un langage commun pour les devs et les expert·es
			</p>
			<div class="flex flex-wrap gap-4">
				<a href="/docs/" class="max-sm:flex-1">
					<Button type={'primary'}>Documentation</Button>
				</a>
				<a href="/studio" class="max-sm:flex-1">
					<Button icon={Play} type={'secondary'}>Éditeur en ligne</Button>
				</a>
			</div>
		</div>
	</div>
</header>

<main class="">
	<section
		class="mt-20 flex flex-col items-center justify-center gap-8 md:mt-36">
		<p class="px-6 text-center text-lg font-normal md:max-w-5xl md:text-2xl">
			Publicodes permet de modéliser des <span class="font-regular"
				>domaines métiers complexes</span
			>, en les décomposant en
			<span class="font-regular">règles élémentaires simples</span>
			qui soient
			<span class="font-regular">lisibles par tout le monde</span>.
		</p>
		<img
			src={PublicodesSchemaSVG}
			alt="Schéma de fonctionnement de
		Publicodes"
			class="mt-12 hidden w-full md:block md:max-w-3xl lg:max-w-4xl" />
	</section>
	<section class="mt-20 flex w-full flex-col items-center gap-16 md:mt-32">
		<div
			class="flex w-full max-w-3xl flex-col gap-10 rounded-sm px-6 md:max-w-4xl lg:max-w-5xl
			xl:max-w-7xl xl:border xl:border-primary-300 xl:p-8">
			<Heading level="h2">Du code clair et lisible</Heading>
			<div class="flex flex-col gap-4">
				<p class="prose-md prose font-normal text-black md:prose-xl">
					Essayez de modifier le <code>salaire brut</code> à
					<code>3000 €/mois</code> dans l'exemple suivant :
				</p>
				<div class="max-sm:-mx-6">
					<PublicodesEditor
						title="Calcul du salaire net"
						onchange={showDocOnSuccess}
						{showDoc}
						size={isMobile ? 'md' : 'lg'}
						code={`salaire brut: 2000 €/mois

cotisations:
  produit:
    - salaire brut
    - taux
  avec:
    taux: 21.7%

salaire net: salaire brut - cotisations
`}></PublicodesEditor>
				</div>
				{#if showDoc}
					<div
						in:fly={{ y: -50, opacity: 0, duration: 100, delay: 500 }}
						class="will-change-transform md:text-xl">
						<Callout type="tip" title="C'était facile, non ?">
							<p class="py-4 font-normal text-black md:text-xl lg:max-w-7xl">
								Même sans connaissances en informatique, il est possible de
								comprendre du code écrit avec Publicodes.
							</p>
						</Callout>
					</div>
				{/if}

				<a class="w-fit" href="/docs">
					{@render buttonWithRightArrow('Découvrir le langage')}
				</a>
			</div>
		</div>
	</section>
	<section
		class="mt-20 flex w-full flex-col items-center gap-16 bg-primary-50 md:mt-32">
		<div
			class="not-prose flex w-full max-w-3xl flex-col justify-center gap-10 px-6 py-20 md:max-w-4xl
			md:py-32 lg:max-w-5xl xl:max-w-7xl">
			<Heading level="h2" icon={Rocket}>Accélérateur d'impact</Heading>
			<p class="w-full text-lg font-normal text-black md:text-xl">
				Publicodes est utilisé pour calculer <strong
					>plusieurs millions de simulations</strong> chaque mois. Découvrez les
				produits phares qui utilisent cette technologie.
			</p>

			<div
				role="list"
				class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each displayedProduits.slice(0, 3) as { img, name, description, url }}
					<Card {img} {url} role="listitem">
						{#snippet title()}
							<h3>{name}</h3>
						{/snippet}
						{description}
					</Card>
				{/each}
			</div>

			<a class="w-fit self-center" href="/realisations">
				{@render buttonWithRightArrow('Toutes les réalisations')}
			</a>
		</div>
	</section>
	<!-- TODO: factorize sections in a snippet? -->
	<section class="flex w-full flex-col items-center gap-16">
		<div
			class="flex w-full max-w-3xl flex-col justify-center gap-10
			px-6 py-20 md:max-w-4xl md:py-32
			lg:max-w-5xl xl:max-w-7xl">
			<Heading level="h2" icon={LibraryBig}>Créateur de communs</Heading>
			<p class="text-lg font-normal text-black md:max-w-7xl md:text-xl">
				Déjà <strong>une dizaine de modèles publiés</strong>. Découvrez les dans
				la bibliothèque de modèles publicodes.
			</p>
			<div class="flex justify-center">
				<PublicodesPackages {packages} />
			</div>
			<a class="w-fit self-center" href="/bibliotheque">
				{@render buttonWithRightArrow('Découvrir tous les modèles')}
			</a>
		</div>
	</section>
	<section class="flex flex-col">
		<Banner
			icon={Microscope}
			background="bg-primary-50"
			title="Pour les expert·es"
			items={[
				{
					subtitle: 'Low code',
					content:
						'Entre le no-code et le code, Publicodes est compréhensible par toute personne ayant déjà manipulé un tableau Excel.'
				},
				{
					subtitle: 'Transparent',
					content:
						"Plus d'erreurs cachées : pour vérifier qu’une règle est correctement implémentées, il suffit de la lire."
				},
				{
					subtitle: 'Un langage commun',
					content:
						'Développeurs, expert·es : tout le monde parle la même langue. Cela veut dire une communication plus fluide, et moins d’erreurs.'
				}
			]} />
		<Banner
			icon={CodeXmlIcon}
			background=""
			title="Pour les développeur·euses"
			items={[
				{
					subtitle: 'Clean architecture',
					content:
						'Publicodes favorise la maintenabilité et la testabilité en découplant clairement le code métier du code applicatif.'
				},
				{
					subtitle: 'Facile à prendre en main',
					content:
						"Il dispose d'une extension VSCode dédiée (coloration syntaxique, goto def, auto-complétion…) et est basé sur la syntaxe YAML."
				},
				{
					subtitle: 'Multi-support',
					content:
						'Son interpréteur JavaScript lui permet d’être embarqué dans un navigateur et évite des appels réseux inutiles.'
				}
			]} />
		<Banner
			icon={LandmarkIcon}
			background="bg-primary-50"
			title="Pour les administrations"
			items={[
				{
					subtitle: 'Rules as code par design',
					content:
						'Publicodes est un langage particulièrement adapté pour transposer la loi en code.'
				},
				{
					subtitle: 'Accélérateur d’open-data',
					content:
						'Vos règles peuvent être facilement publiée et être réutilisées par d’autres acteurs.'
				},
				{
					subtitle: 'Explicabilité',
					content:
						'L’explications auto-générée des résultats de calculs permet de vous conformer à l’obligation de transparence des algorithmes publics.'
				}
			]} />
	</section>
</main>

{#snippet buttonWithRightArrow(text: string)}
	<Button type="secondary">
		<span class="flex items-center gap-2">
			{text}
			<ArrowRight size={26} strokeWidth={1.75} />
		</span>
	</Button>
{/snippet}
