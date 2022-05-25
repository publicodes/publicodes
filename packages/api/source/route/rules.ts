import { Engine } from '../types.js'
import { catchError, PickInObject } from '../utils.js'

export function rules(engine: Engine) {
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

export function rulesId(engine: Engine, id: RulesId) {
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
