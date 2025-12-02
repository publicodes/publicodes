import { FormElementOptions } from '../elements/formElement'
import type Engine from 'publicodes'
import {
	getEvaluatedFormElement,
	type EvaluatedFormElement,
} from '../elements/evaluatedFormElement'
import { UNDEFINED_NODE } from '../utils/utils'
import { FormLayout } from '../layout/formLayout'
import {
	EvaluatedFormLayout,
	EvaluatedGroupLayout,
	EvaluatedSimpleLayout,
	EvaluatedTableLayout,
} from '../layout/evaluatedFormLayout'

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
export function buildFormPage<RuleName extends string>(
	page: Array<FormLayout<RuleName>>,
	engine: Engine<RuleName>,
	targets: Array<RuleName>,
	lastAnswered: RuleName | null,
	formElementOptions: FormElementOptions,
): Array<EvaluatedFormLayout<RuleName>> {
	const lastAnsweredIndex = page.findIndex((layout) => {
		switch (layout.type) {
			case 'simple':
				return layout.rule === lastAnswered
			case 'group':
				return layout.rules.some((element) => element === lastAnswered)
			case 'table':
				return layout.rows.flat().includes(lastAnswered!)
		}
	})

	const formPage = page.map((layout: FormLayout<RuleName>, i) => {
		const evaluate = (rule: RuleName) =>
			evaluateElement(
				engine,
				rule,
				targets,
				lastAnsweredIndex,
				i,
				formElementOptions,
			)
		switch (layout.type) {
			case 'simple': {
				return {
					...layout,
					evaluatedElement: evaluate(layout.rule),
				} as EvaluatedSimpleLayout<RuleName>
			}
			case 'group': {
				return {
					...layout,
					evaluatedElements: layout.rules.map((ruleName) => evaluate(ruleName)),
				} as EvaluatedGroupLayout<RuleName>
			}
			case 'table': {
				return {
					...layout,
					evaluatedRows: layout.rows.map((row) =>
						row.map((ruleName) => evaluate(ruleName)),
					),
				} as EvaluatedTableLayout<RuleName>
			}
		}
	})

	// If its a new page, we focus the first field
	if (lastAnswered) {
		const hasAnyAnswered = formPage.some((layout) => {
			switch (layout.type) {
				case 'simple':
					return layout.evaluatedElement.answered
				case 'group':
					return layout.evaluatedElements.some((element) => element.answered)
				case 'table':
					return layout.evaluatedRows.flat().some((element) => element.answered)
			}
		})

		if (!hasAnyAnswered && formPage.length > 0) {
			switch (formPage[0].type) {
				case 'simple':
					formPage[0].evaluatedElement.autofocus = true
					break
				case 'group': {
					const firstElement = formPage[0].evaluatedElements[0]
					if (firstElement) {
						firstElement.autofocus = true
					}
					break
				}
				case 'table': {
					const firstRow = formPage[0].evaluatedRows[0]
					if (firstRow && firstRow.length > 0) {
						firstRow[0].autofocus = true
					}
					break
				}
			}
		}
	}

	return formPage
}

function evaluateElement<RuleName extends string>(
	engine: Engine<RuleName>,
	rule: RuleName,
	targets: Array<RuleName>,
	lastAnsweredIndex: number,
	currentIndex: number,
	formElementOptions: FormElementOptions,
): FormPageElementProp & EvaluatedFormElement<RuleName> {
	const element = getEvaluatedFormElement(
		engine,
		rule,
		formElementOptions,
	) as FormPageElementProp & EvaluatedFormElement<RuleName>

	element.autofocus = false
	element.useful =
		element.applicable && isUsefulForTargets(engine, targets, element.id)

	// Element are hidden if they are not needed and after the last answered
	// question. This way, the content below automatically moves up.
	element.hidden =
		lastAnsweredIndex >= 0 &&
		currentIndex > lastAnsweredIndex &&
		!element.useful

	element.disabled = !element.useful

	return element
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
