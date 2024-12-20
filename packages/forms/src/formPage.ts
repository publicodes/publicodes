import Engine from 'publicodes'
import { addEvaluation } from './evaluateFormElement'
import type { EvaluatedFormElement } from './evaluateFormElement'
import { getFormElement } from './formElement'
import { UNDEFINED_NODE } from './utils'

export type FormPageElement = EvaluatedFormElement & {
	hidden: boolean
	useful: boolean
	disabled: boolean
	autofocus: boolean
	answered: boolean
}

export function buildFormPage<Name extends string>(
	engine: Engine<Name>,
	targets: Array<Name>,
	page: Array<Name>,
	lastAnswered: Name | null,
): Array<FormPageElement> {
	const lastAnsweredIndex = page.indexOf(lastAnswered as Name)

	const formPage = page.map((dottedName: Name, i) => {
		const element = getFormElement(engine, dottedName) as FormPageElement

		addEvaluation(engine, element)

		element.autofocus = false
		element.answered = element.id in engine.getSituation()
		element.useful =
			element.applicable && isUsefulForTargets(engine, targets, element.id)

		// Element are hidden if they are not needed and after the last answered question. This way, the content below automatically moves up.
		element.hidden =
			lastAnsweredIndex >= 0 && i > lastAnsweredIndex && !element.useful

		element.disabled = !element.useful

		return element
	})

	// If the user started to fill the form, and the current page is unchanged, we focus the first field
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
