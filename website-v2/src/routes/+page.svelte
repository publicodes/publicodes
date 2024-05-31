<script>
	import AnimatedLogo from '$lib/animated-logo.svelte';
	import AdministrationSVG from '$lib/assets/administration.svg';
	import CodeTypingSVG from '$lib/assets/code-typing.svg';
	import SpreadsheetsSVG from '$lib/assets/spreadsheets.svg';
	import Publicodes from '$lib/PublicodesEditor/index.svelte';
	import Button from '$lib/ui/button.svelte';
	import Card from '$lib/ui/card.svelte';
</script>

<!-- Gradient is a little bit inclined (30deg) -->
<header class="bg-gradient-to-r from-sky-700 to-slate-400 py-4">
	<div class="mx-auto mt-4 flex gap-12 p-10 lg:container">
		<div class="flex-1">
			<h1 class="py-8 text-5xl font-bold text-blue-50">Publicodes</h1>
			<p class="mb-4 text-2xl text-blue-50">
				Un langage commun pour les développeurs et les experts
			</p>
			<!-- Large button style whith strong blue background  -->
			<div class="flex gap-4">
				<a href="/tutoriel">
					<Button>Tutoriel</Button>
				</a>
				<a href="/tutoriel">
					<Button light>Voir le guide</Button>
				</a>
			</div>
		</div>

		<div class="mt-4 flex justify-center self-center p-1 xl:flex-1 xl:scale-125">
			<AnimatedLogo />
		</div>
	</div>
</header>

<main class="mx-auto p-8 xl:container">
	<section>
		<p
			class="prose border-l-4 border-sky-600 px-4 text-xl leading-relaxed prose-strong:font-medium"
		>
			Publicodes permet de modéliser des <strong>domaines métiers complexes</strong>, en les
			décomposant en <strong>règles élémentaires simples</strong> qui soient
			<strong>lisibles par tout le monde</strong>.
		</p>
	</section>
	<section>
		<div class="grid justify-center gap-12 lg:grid-cols-2 2xl:grid-cols-3">
			<Card>
				<img slot="img" src={SpreadsheetsSVG} alt="Illustration d'un tableur Excel" />

				<h2 slot="title">Pour les experts</h2>

				<ol slot="content">
					<li>
						<strong>Low code</strong> ⋅ Entre le no-code et le code, Publicodes est compréhensible par
						toute personne ayant déjà manipulé un tableau Excel.
					</li>
					<li>
						<strong>Transparent</strong> ⋅ Plus d'erreurs cachées : pour vérifier qu’une règle est correctement
						implémentées, il suffit de la lire.
					</li>
					<li>
						<strong>Un langage commun</strong> ⋅ Développeurs, experts : tout le monde parle la même
						langue. Cela veut dire une communication plus fluide, et moins d’erreurs.
					</li>
				</ol>

				<a slot="link" href="/lp/administration"> En savoir plus </a>
			</Card>
			<Card>
				<img
					slot="img"
					src={CodeTypingSVG}
					alt="Illustration d'un ordinateur de développement informatique"
				/>

				<h2 slot="title">Pour les développeurs</h2>

				<ol slot="content">
					<li>
						<strong>Clean architecture</strong> ⋅ Publicodes favorise la maintenabilité et la testabilité
						en découplant clairement le code métier du code applicatif.
					</li>
					<li>
						<strong>Facile à prendre en main</strong> ⋅ Il dispose d'une extension VSCode dédiée (coloration
						syntaxique, goto def, auto-complétion…) et est basé sur la syntaxe YAML.
					</li>
					<li>
						<strong>Multi-support</strong> ⋅ Son interpréteur JavaScript lui permet d’être embarqué dans
						dans un navigateur et évite des appels réseaux inutiles.
					</li>
				</ol>

				<a slot="link" href="/lp/administration"> En savoir plus </a>
			</Card>
			<Card>
				<img
					slot="img"
					src={AdministrationSVG}
					alt="Illustration d'une administration"
					class="object-contain"
				/>

				<h2 slot="title">Pour les administrations</h2>

				<ol slot="content">
					<li>
						<strong> Rule as code par design</strong> ⋅ Publicodes est un langage particulièrement adapté
						pour transposer la loi en code.
					</li>
					<li>
						<strong>Accerateur d'open-data</strong> ⋅ Vos règles peuvent être facilement publiée et être
						réutilisées par d’autres acteurs.
					</li>
					<li>
						<strong>Explicabilité</strong> ⋅ L’explications auto-générée des résultats de calculs permet
						de vous conformer à l’obligation de transparence des algorithmes publics.
					</li>
				</ol>

				<a slot="link" href="/lp/administration"> En savoir plus </a>
			</Card>
		</div>
	</section>
	<section class="mt-8">
		<Publicodes
			title="Calcul du salaire net"
			code={`cotisations salariales:
	description: |
		Les cotisations salariales sont des prélèvements obligatoires sur 
		le salaire brut. Elles sont destinées au financement de la 
		protection sociale.
		
	produit:
		- salaire brut
		- taux
	avec:
		taux: 21.7%
	
	salaire net: salaire brut - cotisations salariales
	salaire brut: 2300 €/mois
`}
		></Publicodes>
	</section>
</main>
