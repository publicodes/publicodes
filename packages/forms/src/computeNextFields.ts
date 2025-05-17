import type Engine from 'publicodes'
import { RuleWithFormMeta } from '.'
import { PageBuilderOutput } from './formBuilder'

/**
 * Computes the next fields that need to be asked next in a form.
 *
 * This function evaluates the given targets using the engine and returns a sorted array
 * of missing variable names (dotted names) that haven't been asked yet in previous pages.
 * The fields are sorted by their "missing score" in descending order.
 *
 * @param engine - The Publicodes engine instance used for evaluation
 * @param state - Object containing form state with targets and previous pages
 * @param state.targets - Array of target rule names to evaluate
 * @param state.pages - Array of pages, where each page is an array of rule names
 * @returns Array of dotted names representing the next fields to ask, sorted by priority
 */
export function computeNextFields<Name extends string>(
	engine: Engine<Name>,
	state: { targets: Array<Name>; pages: PageBuilderOutput<Name> },
) {
	const missings = engine.evaluate({
		somme: state.targets,
	}).missingVariables
	const sortedRules = Object.entries(missings)
		.filter(
			([dottedName]) =>
				!state.pages
					.map((page) => page.questionsInPage)
					.flat()
					.includes(dottedName as Name),
		)
		.sort(([, score1], [, score2]) => {
			return score2 - score1
		})
		.map(([dottedName]) => dottedName as Name)
	return sortedRules
		.map(
			(name) =>
				[
					name,
					(engine.getRule(name).rawNode as RuleWithFormMeta).form?.position ??
						0,
				] as const,
		)
		.map(
			([name, position]) => [name, position != 0 ? 1 / position : 0] as const,
		)
		.sort(([, a], [, b]) => {
			return b - a
		})
		.map(([name]) => name)
}
