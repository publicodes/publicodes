import { Situation, NewEngine, Expressions } from '@/types'
import { catchError, PickInObject } from '@/utils'

export interface APIParameters {
	situation?: Situation
}

export function evaluate(
	newEngine: NewEngine,
	expressions: Expressions,
	{ situation }: APIParameters = {}
) {
	const engine = newEngine(expressions, situation)
	const situationResult = catchError(() => engine.setSituation(situation))

	const keysKept = [
		'nodeValue' as const,
		'unit' as const,
		'traversedVariables' as const,
		'missingVariables' as const,
	]

	const evaluateResult = (
		Array.isArray(expressions) ? expressions : [expressions]
	).map((expression) =>
		catchError(() => PickInObject(engine.evaluate(expression), keysKept))
	)

	return {
		situation: situationResult,
		evaluate: evaluateResult,
	}
}
