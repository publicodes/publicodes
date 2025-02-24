import type { Rule } from 'publicodes'

export type * from './evaluatedFormElement'
export { getEvaluatedFormElement } from './evaluatedFormElement'

export type * from './formElement'
export { getFormElement } from './formElement'

export type * from './buildFormPage'
export { buildFormPage } from './buildFormPage'

export * from './form'
export type { FormState } from './form'

export { computeNextFields } from './computeNextFields'
export { groupByNamespace } from './groupByNamespace'

export { convertInputValueToPublicodes } from './convertInputValueToPublicodes'
export { updateSituationWithInputValue as updateSituationWithFormValue } from './updateSituationWithFormValue'

/**
 * A Publicodes Rule with additional metadata for form input
 *
 * They are used to determine the type of input to display
 */
export type RuleWithFormMeta = Rule & {
	type?: 'date' | 'nombre' | 'texte' | 'booléen'
} & (
		| {
				type?: 'booléen'
				saisie?: 'case à cocher' | 'oui/non' // | 'interrupteur'
		  }
		| {
				'une possibilité': unknown
				saisie?:
					| 'menu déroulant'
					| 'boutons radio'
					| 'cartes'
					| {
							style?: 'boutons radio' | 'cartes' | 'défaut'
							orientation: 'horizontal' | 'vertical'
					  }
		  }
		| {
				type?: 'texte'
				saisie?: 'texte court' | 'texte long' // | 'email' | 'url' | 'téléphone'
		  }
		| {
				type?: 'date'
				saisie?: 'année' | 'mois'
		  }
	)
