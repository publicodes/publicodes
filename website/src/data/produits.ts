import ekofestLogo from './logos/ekofest-banner.png';
import karburanProImg from './logos/karburan-pro.webp';
import mesAidesVeloImg from './logos/mes-aides-velo.webp';
import mesAidesRenoImg from './logos/mes-aides-reno.webp';
import monEmpreinteEauImg from './logos/mon-empreinte-eau.webp';
import jagisImg from './logos/jagis.webp';

const rawProduits = [
	{
		slug: 'nos-gestes-climat',
		name: 'Nos Gestes Climat',
		img: '/ngc-og-image.png',
		description:
			"Le calculateur d'empreinte climat personnelle de référence, complètement ouvert.",
		url: 'https://nosgestesclimat.fr',
		github: 'https://github.com/incubateur-ademe/nosgestesclimat'
	},
	{
		slug: 'mon-entreprise',
		name: 'Mon-entreprise',
		img: 'https://mon-entreprise.urssaf.fr/logo-share.png',
		description:
			'Trouvez des réponses personnalisées à vos questions sur la création et la gestion de votre entreprise avec des assistants et simulateurs.',
		url: 'https://mon-entreprise.urssaf.fr',
		github: 'https://github.com/betagouv/mon-entreprise/'
	},
	{
		slug: 'code-du-travail-numerique',
		name: 'Code du travail numérique',
		img: 'https://code.travail.gouv.fr/static/assets/img/social-preview.png',
		description:
			'Développe un simulateur de préavis de retraite intégrant de nombreuses conventions collectives.',
		url: 'https://code.travail.gouv.fr',
		github: 'https://github.com/SocialGouv/code-du-travail-numerique'
	},
	{
		slug: 'impact-co2',
		img: 'https://impactco2.fr/meta/main.png',
		name: 'Impact CO2',
		url: 'https://impactco2.fr',
		github: 'https://github.com/incubateur-ademe/impactco2',
		description:
			"Comparateurs d'empreinte carbone pour les produits du quotidien et le transport."
	},
	{
		slug: 'mes-aides-vélo',
		url: 'https://mesaidesvelo.fr/',
		github: 'https://github.com/mquandalle/mesaidesvelo',
		name: 'Mes Aides Vélo',
		img: mesAidesVeloImg,
		description:
			"Découvrez l'ensemble des aides à l'achat ou la localisation de vélo proposées par votre ville, département, région et par l'État."
	},
	{
		slug: 'ekofest',
		name: 'Ekofest',
		url: 'https://ekofest.fr/',
		img: ekofestLogo,
		github: 'https://github.com/ekofest/ekofest',
		description: "Calculateur d'empreinte carbone pour les festivals."
	},
	{
		slug: 'estime',
		name: 'Estime',
		url: 'https://beta.gouv.fr/startups/estime.html',
		img: 'https://raw.githubusercontent.com/StartupsPoleEmploi/estime-frontend/master/.gitlab/images/logo_estime_v2.png',
		description: "Simulateur d'aides à la reprise d'emploi",
		github: 'https://github.com/StartupsPoleEmploi/estime-frontend'
	},
	{
		slug: 'karburan',
		img: karburanProImg,
		name: 'karburan',
		url: 'https://www.karburan.pro/',
		description:
			"Solution de portage salarial en marque blanche et prête à l'emploi."
	},

	{
		slug: 'aides-jeune',
		name: 'Mes Aides - 1jeune1solution',
		url: 'https://mes-aides.1jeune1solution.beta.gouv.fr/',
		img: 'https://mes-aides.1jeune1solution.beta.gouv.fr//img/1jeune1solution/Twitter_1024x512.png',
		description: 'Évaluez vos droits à 960 aides en moins de 5 minutes.',
		github: 'https://github.com/betagouv/aides-jeunes'
	},
	{
		slug: 'futur-eco',
		name: 'Futureco',
		description: 'Futureco. Découvre les impacts de chaque geste du quotidien',
		url: 'https://futur.eco',
		github: 'https://github.com/laem/futur.eco'
	},
	{
		slug: 'transition-ecologique-entreprises',
		name: 'Transition écologique des entreprises',
		description:
			'Le service public Transition Écologique des Entreprises est un guichet d’accueil, d’aide et d’accompagnement dans la transition écologique des entreprises.',
		url: 'https://mission-transition-ecologique.beta.gouv.fr/',
		img: 'https://mission-transition-ecologique.beta.gouv.fr/images/TEE-preview-image-529-by-298.png',
		github: 'https://github.com/betagouv/mission-transition-ecologique/'
	},
	{
		slug: 'mes-aides-reno',
		name: 'Mes Aides Réno',
		description:
			'Calculateur des aides à la rénovation énergétique de votre logement (MaPrimeRénov, CEE...).',
		url: 'https://mesaidesreno.beta.gouv.fr/',
		img: mesAidesRenoImg,
		github: 'https://github.com/betagouv/reno/'
	},
	{
		slug: 'jagis',
		name: "J'agis",
		description:
			'Des solutions pour la transition écologique à mon échelle : aides financières, conseils adaptés et outils pratiques pour un quotidien durable.',
		url: 'https://jagis.beta.gouv.fr/',
		img: jagisImg,
		github: 'https://github.com/betagouv/agir-back'
	},
	{
		slug: 'mon-empreinte-eau',
		name: 'Mon Empreinte Eau',
		description:
			'Calculateur d’empreinte eau individuelle pour sensibiliser à la consommation d’eau directe et indirecte.',
		url: 'https://mon-empreinte-eau.fr/',
		img: monEmpreinteEauImg
	},
	{
		slug: 'france-chaleur-urbaine',
		name: 'France Chaleur Urbaine',
		description:
			"Projet d'innovation pour accélérer le raccordement des bâtiments aux réseaux de chaleur en vue de l'atteinte des objectifs de développement de la chaleur d'origine renouvelable.",
		url: 'https://france-chaleur-urbaine.beta.gouv.fr',
		github: 'https://github.com/betagouv/france-chaleur-urbaine-publicodes',
		img: 'https://france-chaleur-urbaine.beta.gouv.fr/img/preview/fcu-preview-20220517.min.jpg'
	}
] as const;

export const produits: readonly Produit[] = rawProduits;

export type ProduitSlug = (typeof rawProduits)[number]['slug'];

export type Produit = {
	name: string;
	slug: ProduitSlug;
	description: string;
	url: string;
	img?: string;
	github?: string;
};
