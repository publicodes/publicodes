import { NewEngine } from '@/types'
import { catchError, PickInObject } from '@/utils'

export function rules(newEngine: NewEngine) {
	const engine = newEngine({})

	const rules = engine.getParsedRules()

	const filteredRules = Object.fromEntries(
		Object.entries(rules).map(([key, val]) => [
			key,
			PickInObject(val, [
				'nodeKind',
				'rawNode',
				'replacements',
				'suggestions',
				'title',
			]),
		])
	)

	return filteredRules
}

export function rulesId(newEngine: NewEngine, id: string) {
	const engine = newEngine({})

	const [error, result] = catchError(() => engine.getRule(id))

	return !error
		? PickInObject(result, ['title', 'suggestions', 'rawNode', 'nodeKind'])
		: { error: { message: error.message } }
}
