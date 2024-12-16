import { Rule } from 'publicodes'

export { addEvaluation } from './evaluateFormElement'
export type { EvaluatedFormElement } from './evaluateFormElement'

export { getFormElement } from './formElement'
export type { FormElement } from './formElement'

export { buildFormPage } from './formPage'
export type { FormPageElement } from './formPage'

export * from './formState'
export type { FormState } from './formState'

export { computeNextFields, createNextPage, countNextPages } from './nextPage'
export type { PageOptions } from './nextPage'

export { updateSituationWithFormValue } from './updateSituationWithFormValue'
export { convertInputValueToPublicodes } from './convertInputValueToPublicodes'

/**
 * A Publicodes Rule with additional metadata for form input
 *
 * They are used to determine the type of input to display
 */
export type RuleWithFormMeta = Rule & {
	type?: 'date' | 'nombre' | 'texte' | 'booléen'
} & (
		| {
				type: 'booléen'
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
				type: 'texte'
				saisie?: 'texte court' | 'texte long' // | 'email' | 'url' | 'téléphone'
		  }
		| {
				type: 'date'
				saisie?: 'année' | 'mois'
		  }
	)
