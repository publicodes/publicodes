import { NewEngine } from '../types'
import { catchError, PickInObject } from '../utils'

export function rules(newEngine: NewEngine) {
	const engine = newEngine({})

	const rules = engine.getParsedRules()

	const filteredRules = Object.fromEntries(
		Object.entries(rules).map(([key, val]) => [
			key,
			PickInObject(val, [
				'title',
				'nodeKind',
				'rawNode',
				'replacements',
				'suggestions',
			]),
		])
	)

	return filteredRules
}

type RulesId = string

export function rulesId(newEngine: NewEngine, id: RulesId) {
	const engine = newEngine({})

	const [error, result] = catchError(() => engine.getRule(id))

	return !error
		? PickInObject(result, [
				'title',
				'nodeKind',
				'rawNode',
				'replacements',
				'suggestions',
		  ])
		: { error: { message: error.message } }
}
