import type { Rule } from 'publicodes'

export type * from './elements/evaluatedFormElement'
export { getEvaluatedFormElement } from './elements/evaluatedFormElement'

export type * from './elements/formElement'
export { getFormElement } from './elements/formElement'

export type * from './builder/buildFormPage'
export { buildFormPage } from './builder/buildFormPage'

export * from './builder/formBuilder'
export type { FormState } from './builder/formBuilder'

export { computeNextFields } from './builder/computeNextFields'
export { groupByNamespace } from './utils/groupByNamespace'

export { convertInputValueToPublicodes } from './utils/convertInputValueToPublicodes'
export { updateSituationWithInputValue as updateSituationWithFormValue } from './utils/updateSituationWithFormValue'

/**
 * A Publicodes Rule with additional metadata for form input.
 *
 * These metadata are used to customize the user interface directly from Publicodes rules.
 * They determine the type of input to display, labels, descriptions, and the order of questions.
 *
 * In YAML, these metadata are added with the `form` key:
 *
 * ```yaml
 * TJM:
 *     description: |
 *         Tarif journalier hors taxe facturé aux clients.
 *         Généralement entre 300 et 800 €/jour.
 *     unité: €/jour facturé
 *     form:
 *         position: 1
 *         label: Tarif journalier
 *         description: Indiquez votre tarif journalier hors taxe
 * ```
 *
 * The form metadata can customize:
 * - Input type (checkbox, radio buttons, dropdown, text, etc.)
 * - Labels and descriptions
 * - Question order/priority
 *
 * The rule can have different input types and configurations based on its type.
 */
export type RuleWithFormMeta = Rule & {
	/**
	 * The data type of the rule.
	 * This affects what input controls are available in the form.
	 */
	type?: 'date' | 'nombre' | 'texte' | 'booléen'
} & (
		| {
				/**
				 * Boolean type configuration.
				 * Used for yes/no questions or checkboxes.
				 */
				type?: 'booléen'
				form: {
					/**
					 * The input style for boolean values:
					 * - 'case à cocher': Displays a checkbox
					 * - 'oui/non': Displays yes/no radio buttons
					 */
					saisie?: 'case à cocher' | 'oui/non' // | 'interrupteur'
				}
		  }
		| {
				/**
				 * Multiple choice configuration.
				 * Used when the rule has a set of predefined options.
				 */
				'une possibilité': unknown
				form: {
					/**
					 * The input style for multiple choice questions:
					 * - 'menu déroulant': Dropdown select menu
					 * - 'boutons radio': Standard radio buttons
					 * - 'cartes': Card-style selectable options
					 *
					 * Example in YAML:
					 * ```yaml
					 * une possibilité:
					 *   - option1: Value 1
					 *   - option2: Value 2
					 * form:
					 *   saisie: boutons radio
					 * ```
					 */
					orientation?: 'horizontal' | 'vertical'
					saisie?: 'menu déroulant' | 'boutons radio' | 'cartes'
				}
		  }
		| {
				/**
				 * Text input configuration.
				 * Used for collecting text-based information.
				 */
				type?: 'texte'
				form: {
					/**
					 * The input style for text values:
					 * - 'texte court': Single-line text input
					 * - 'texte long': Multi-line text area
					 *
					 * Example in YAML:
					 * ```yaml
					 * type: texte
					 * form:
					 *   saisie: texte long
					 * ```
					 */
					saisie?: 'texte court' | 'texte long' // | 'email' | 'url' | 'téléphone'
				}
		  }
		| {
				/**
				 * Date input configuration.
				 * Used for collecting date information.
				 */
				type?: 'date'
				form: {
					/**
					 * The input style for date values:
					 * - 'année': Year selection only
					 * - 'mois': Month and year selection
					 *
					 * Example in YAML:
					 * ```yaml
					 * type: date
					 * form:
					 *   saisie: année
					 * ```
					 */
					saisie?: 'année' | 'mois'
				}
		  }
	) & {
		form: {
			/**
			 * Custom label to display for this input field.
			 * If not provided, the rule's name or description will be used.
			 */
			label?: string

			/**
			 * Detailed description to display below the input field.
			 * This can provide additional context or instructions to the user.
			 */
			description?: string

			/**
			 * Controls the order/priority of questions.
			 * Lower numbers will be displayed first
			 * Negative numbers will be displayed last
			 */
			position?: number
		}
	}
