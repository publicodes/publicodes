import { FormElementOptions } from './formElement'
import type Engine from 'publicodes'
import {
	getEvaluatedFormElement,
	type EvaluatedFormElement,
} from './evaluatedFormElement'
import { UNDEFINED_NODE } from './utils'
import { FormLayout } from './formLayout'

/**
 * Properties that control how a form element should be displayed and behave in the UI.
 *
 * These properties are computed based on the form's state and progression to create
 * a dynamic, guided experience through multi-step forms.
 */
export type FormPageElementProp = {
	/** Whether the element should be visually hidden */
	hidden: boolean
	/** Whether the element is needed for computing target rules */
	useful: boolean
	/** Whether user interaction with the element should be prevented */
	disabled: boolean
	/** Whether the element should receive focus when rendered */
	autofocus: boolean
	/** Whether the field must be filled before proceeding */
	required: boolean
}

/**
 * Builds an interactive form page with dynamic field behavior based on user progression.
 *
 * This function enhances form elements with UI-specific behaviors needed for a step-by-step form experience:
 *
 * - Progressive disclosure: Fields are shown/hidden based on their relevance to target computations
 * - Focus management: Auto-focuses the first unanswered field when entering a new page
 * - Field dependencies: Disables fields that are no longer relevant for target calculations
 * - Visual cleanup: Automatically collapses irrelevant fields that appear after the last answered question
 *
 * Use this when building multi-step forms where you want to guide users through a sequence of questions
 * while maintaining a clean interface by hiding unnecessary fields.
 *
 * @param page - Array of rule names representing form fields to display
 * @param engine - Publicodes engine instance containing rules and current situation
 * @param targets - Target rules that determine which fields are useful
 * @param lastAnswered - The most recently answered field, used for progressive disclosure
 *
 * @returns Array of form elements enhanced with UI interaction states (hidden, disabled, autofocus)
 *
 * @example
 * ```typescript
 * // In a form wizard component
 * const pageElements = buildFormPage(
 *   ['person . age', 'person . income'],
 *   engine,
 *   ['taxes . eligible'],
 *   'person . age'
 * )
 * // Returns elements with proper focus/visibility for a form wizard interface
 * ```
 */
export function buildFormPage<Name extends string>(
	page: Array<FormLayout<Name>>,
	engine: Engine<Name>,
	targets: Array<Name>,
	lastAnswered: Name | null,
	formElementOptions: FormElementOptions,
): Array<FormPageElementProp & EvaluatedFormElement<Name>> {
	const lastAnsweredIndex = page.indexOf(lastAnswered as Name)

	const formPage = page.map((dottedName: Name, i) => {
		const element = getEvaluatedFormElement(
			engine,
			dottedName,
			formElementOptions,
		) as FormPageElementProp & EvaluatedFormElement<Name>

		element.autofocus = false
		element.useful =
			element.applicable && isUsefulForTargets(engine, targets, element.id)

		// Element are hidden if they are not needed and after the last answered question. This way, the content below automatically moves up.
		element.hidden =
			lastAnsweredIndex >= 0 && i > lastAnsweredIndex && !element.useful

		element.disabled = !element.useful

		return element
	})

	// If its a new page, we focus the first field
	if (lastAnswered && formPage.every(({ answered }) => !answered)) {
		formPage[0].autofocus = true
	}

	return formPage
}

function isUsefulForTargets<Name extends string>(
	engine: Engine<Name>,
	goals: Array<Name>,
	dottedName: Name,
) {
	return (
		dottedName in
		engine.evaluate({
			somme: goals,
			contexte: {
				[dottedName]: UNDEFINED_NODE,
			},
		}).missingVariables
	)
}
