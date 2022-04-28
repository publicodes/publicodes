import { NewEngine } from '@/types'

export function rules(newEngine: NewEngine) {
	const engine = newEngine({})

	return engine.getParsedRules()
}

export function rulesId(newEngine: NewEngine, id: string) {
	const engine = newEngine({})

	return engine.getRule(id)
}
