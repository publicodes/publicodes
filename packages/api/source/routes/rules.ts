import { NewEngine } from '@/types'
import { catchError } from '@/utils'

export function rules(newEngine: NewEngine) {
	const engine = newEngine({})

	return engine.getParsedRules()
}

export function rulesId(newEngine: NewEngine, id: string) {
	const engine = newEngine({})

	const [error, result] = catchError(() => engine.getRule(id))

	return !error ? result : { error: { message: error.message } }
}
