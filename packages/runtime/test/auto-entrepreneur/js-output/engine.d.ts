export default class Engine {
	constructor(cache?: boolean)
	evaluate<R extends Inputs>(
		rule: R,
		context: Partial<{
			[K in keyof Context[R]['parameters'] &
				Inputs]: Context[K]['value']['type']
		}>,
	): Evaluation<R>
}

export type Inputs = keyof Context

export type Parameters<R extends Inputs> = keyof Context[R]['parameters']

export type Evaluation<R extends Inputs> = {
	value: Context[R]['value']['type'] | undefined | null
	traversedParameters: Parameters<R>[]
	missingParameters: Parameters<R>[]
}

export type Context = {
	date: { value: { type: Date }; parameters: { date: null } }
	'dirigeant . auto-entrepreneur . Acre . notification calcul ACRE annuel': {
		value: { type: boolean }
		parameters: { 'dirigeant . exonérations . ACRE': null }
	}
	'dirigeant . auto-entrepreneur . Cipav . adhérent': {
		value: { type: boolean }
		parameters: { 'dirigeant . auto-entrepreneur . Cipav . adhérent': null }
	}
	'dirigeant . auto-entrepreneur . cotisations et contributions': {
		value: { type: number; unit: '€/mois' }
		parameters: {
			date: null
			'dirigeant . auto-entrepreneur . Cipav . adhérent': null
			'entreprise . activité . nature': null
			'entreprise . activité . nature . libérale . réglementée': null
			"entreprise . chiffre d'affaires . BIC": null
			"entreprise . chiffre d'affaires . service BIC": null
			"entreprise . chiffre d'affaires . service BNC": null
			"entreprise . chiffre d'affaires . vente restauration hébergement": null
			'entreprise . date de création': null
		}
	}
	'dirigeant . auto-entrepreneur . cotisations et contributions . CFP': {
		value: { type: number; unit: '€/mois' }
		parameters: {
			date: null
			'dirigeant . auto-entrepreneur . Cipav . adhérent': null
			'entreprise . activité . nature': null
			'entreprise . activité . nature . libérale . réglementée': null
			"entreprise . chiffre d'affaires . BIC": null
			"entreprise . chiffre d'affaires . service BNC": null
			'entreprise . date de création': null
		}
	}
	'dirigeant . auto-entrepreneur . cotisations et contributions . TFC': {
		value: { type: number; unit: '€/mois' }
		parameters: {
			'entreprise . activité . nature': null
			"entreprise . chiffre d'affaires . service BIC": null
			"entreprise . chiffre d'affaires . vente restauration hébergement": null
		}
	}
	'dirigeant . auto-entrepreneur . cotisations et contributions . cotisations': {
		value: { type: number; unit: '€/mois' }
		parameters: {
			date: null
			'dirigeant . auto-entrepreneur . Cipav . adhérent': null
			'entreprise . activité . nature': null
			'entreprise . activité . nature . libérale . réglementée': null
			"entreprise . chiffre d'affaires . service BIC": null
			"entreprise . chiffre d'affaires . service BNC": null
			"entreprise . chiffre d'affaires . vente restauration hébergement": null
			'entreprise . date de création': null
		}
	}
	'dirigeant . auto-entrepreneur . impôt . versement libératoire . seuil dépassé': {
		value: { type: boolean }
		parameters: { 'impôt . foyer fiscal . revenu fiscal de référence': null }
	}
	'dirigeant . auto-entrepreneur . revenu net': {
		value: { type: number; unit: '€/mois' }
		parameters: {
			date: null
			'dirigeant . auto-entrepreneur . Cipav . adhérent': null
			'entreprise . activité . nature': null
			'entreprise . activité . nature . libérale . réglementée': null
			"entreprise . chiffre d'affaires . BIC": null
			"entreprise . chiffre d'affaires . service BIC": null
			"entreprise . chiffre d'affaires . service BNC": null
			"entreprise . chiffre d'affaires . vente restauration hébergement": null
			'entreprise . date de création': null
		}
	}
	'dirigeant . exonérations . ACRE': {
		value: { type: boolean }
		parameters: { 'dirigeant . exonérations . ACRE': null }
	}
	'entreprise . activité . nature': {
		value: { type: string }
		parameters: { 'entreprise . activité . nature': null }
	}
	'entreprise . activité . nature . libérale . réglementée': {
		value: { type: boolean }
		parameters: {
			'entreprise . activité . nature . libérale . réglementée': null
		}
	}
	"entreprise . chiffre d'affaires": {
		value: { type: number; unit: '€/mois' }
		parameters: {
			"entreprise . chiffre d'affaires . BIC": null
			"entreprise . chiffre d'affaires . service BIC": null
			"entreprise . chiffre d'affaires . service BNC": null
			"entreprise . chiffre d'affaires . vente restauration hébergement": null
		}
	}
	"entreprise . chiffre d'affaires . BIC": {
		value: { type: number; unit: '€/mois' }
		parameters: { "entreprise . chiffre d'affaires . BIC": null }
	}
	"entreprise . chiffre d'affaires . service BIC": {
		value: { type: number; unit: '€/mois' }
		parameters: { "entreprise . chiffre d'affaires . service BIC": null }
	}
	"entreprise . chiffre d'affaires . service BNC": {
		value: { type: number; unit: '€/mois' }
		parameters: { "entreprise . chiffre d'affaires . service BNC": null }
	}
	"entreprise . chiffre d'affaires . vente restauration hébergement": {
		value: { type: number; unit: '€/mois' }
		parameters: {
			"entreprise . chiffre d'affaires . vente restauration hébergement": null
		}
	}
	'entreprise . date de création': {
		value: { type: Date }
		parameters: { 'entreprise . date de création': null }
	}
	'impôt . foyer fiscal . revenu fiscal de référence': {
		value: { type: number; unit: '€/an' }
		parameters: { 'impôt . foyer fiscal . revenu fiscal de référence': null }
	}
}
