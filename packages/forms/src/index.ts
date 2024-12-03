import { Rule } from 'publicodes'

export { evaluateFormElement } from './evaluateFormElement'
export type { FormElementWithValue } from './evaluateFormElement'
export { getFormElement } from './formElement'
export type { FormElement } from './formElement'

export * from './formPage'
export { setFormValue } from './setFormValue'

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
