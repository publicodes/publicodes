import Engine, { utils } from 'publicodes'
import { FormElementWithValue } from '.'
import { UNDEFINED_NODE } from './utils'

export function getNextPage<Name extends string>(
	engine: Engine<Name>,
	goals: Array<Name>,
): Array<Name> {
	const missings = engine.evaluate({
		somme: goals,
	}).missingVariables
	const sortedRules = Object.entries(missings)
		.sort(([, score1], [, score2]) => {
			return score1 - score2
		})
		.map(([dottedName]) => dottedName as Name)

	if (sortedRules.length === 0) {
		return []
	}

	return sortedRules.filter((dottedName) =>
		utils.findCommonAncestor(dottedName, sortedRules[0]),
	)
}

export function pageIsComplete<Name extends string>(
	engine: Engine,
	goals: Array<Name>,
	page: Array<FormElementWithValue>,
): boolean {
	const situation = engine.getSituation()
	return page.every(
		(element) =>
			!element.isApplicable ||
			!element.required ||
			element.id in situation ||
			!isNeeded(engine, goals, element.id),
	)
}

function isNeeded<Name extends string>(
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

export type FormElementWithNecessity = FormElementWithValue & {
	isNeeded: boolean
}
export function evaluateNecessity<Name extends string>(
	engine: Engine<Name>,
	goals: Array<Name>,
	formElement: FormElementWithValue,
) {
	const element = formElement as FormElementWithValue & {
		isNeeded: boolean
	}

	if (element.isApplicable === false) {
		element.isNeeded = false
		return element
	}

	element.isNeeded = isNeeded(engine, goals, element.id)
	return element
}
