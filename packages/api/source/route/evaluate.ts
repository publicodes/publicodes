import { Expressions, NewEngine, Situation } from '../types.js'
import { catchError, PickInObject } from '../utils.js'

export interface EvaluateBody {
	expressions: Expressions
	situation?: Situation
}

export function evaluate(
	newEngine: NewEngine,
	{ expressions, situation }: EvaluateBody
) {
	const engine = newEngine(expressions, situation)
	const [error] = catchError(() => engine.setSituation(situation))

	const keysKept = [
		'nodeValue' as const,
		'unit' as const,
		'traversedVariables' as const,
		'missingVariables' as const,
	]

	const evaluateResult = (
		Array.isArray(expressions) ? expressions : [expressions]
	).map((expression) => {
		const [error, result] = catchError(() =>
			PickInObject(engine.evaluate(expression), keysKept)
		)

		return !error ? result : { error: { message: error.message } }
	})

	return {
		evaluate: evaluateResult,
		situationError: error && { message: error.message },
	}
}
