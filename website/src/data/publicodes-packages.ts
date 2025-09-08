import type { ProduitSlug } from './produits'

export const publicodesPackages: readonly PublicodesPackage[] = [
	{
		npm: '@incubateur-ademe/nosgestesclimat',
		maintainer: 'nos-gestes-climat',
		users: ['jagis']
	},
	{
		npm: '@incubateur-ademe/publicodes-acv-numerique',
		maintainer: 'nos-gestes-climat',
		users: ['impact-co2']
	},
	{
		npm: '@incubateur-ademe/publicodes-commun',
		maintainer: 'nos-gestes-climat',
		users: ['ekofest', 'impact-co2'],
		description:
			"Ensemble de règles communes utilisées pour l'implémentation des modèles publicodes de l'incubateur de l'ADEME"
	},
	{
		npm: '@incubateur-ademe/publicodes-impact-livraison',
		maintainer: 'nos-gestes-climat',
		users: ['impact-co2'],
		description:
			'Un modèle Publicodes pour le simulateur Impact Livraison de Impact CO2'
	},
	{
		npm: '@socialgouv/modeles-social',
		maintainer: 'code-du-travail-numerique'
	},
	{
		npm: 'modele-social',
		maintainer: 'mon-entreprise',
		users: ['estime', 'karburan']
	},
	{
		npm: 'futureco-data',
		maintainer: 'futur-eco',
		users: ['nos-gestes-climat']
	},
	{
		npm: 'publicodes-evenements',
		maintainer: 'ekofest',
		description:
			"Modèle du simulateur d'empreinte carbone des événements d'Ekofest"
	},
	{
		npm: '@betagouv/aides-velo',
		maintainer: 'jagis',
		users: ['aides-jeune', 'mes-aides-vélo']
	},
	{
		npm: 'exoneration-covid',
		maintainer: 'mon-entreprise'
	},
	{
		npm: '@betagouv/france-chaleur-urbaine-publicodes',
		maintainer: 'france-chaleur-urbaine',
		description:
			"Modèle Publicodes du comparateur réalisé en partenariat avec l'association AMORCE dans le cadre de l'action C3 du programme européen Heat & Cool"
	},
	{
		npm: 'mesaidesreno',
		maintainer: 'mes-aides-reno',
		description: "Aides et coût d'une rénovation thermique"
	}
]

export type PublicodesPackage = {
	npm: string
	maintainer: string
	description?: string
	users?: ProduitSlug[]
}
