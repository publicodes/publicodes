import { Engine, Expressions, Situation } from '../types.js'
import { catchError, PickInObject } from '../utils.js'

export interface EvaluateBody {
	expressions: Expressions
	situation?: Situation
}

export function evaluate(
	originalEngine: Engine,
	{ expressions, situation }: EvaluateBody,
) {
	const engine = originalEngine.shallowCopy()
	originalEngine.subEngines = [] // This line avoid memory leak cause by multiple call to shallowCopy(), issue https://github.com/betagouv/publicodes/issues/239

	const warnings: Array<{ message: string }> = []
	if (engine.baseContext) {
		engine.baseContext.logger = {
			error: console.error,
			log: console.log,
			warn(warning: string) {
				warnings.push({ message: warning })
			},
		}
	}

	const [situationError] = catchError(() => engine.setSituation(situation))

	if (situationError) {
		return { situationError: { message: situationError.message } }
	}

	const keysKept = [
		'nodeValue' as const,
		'unit' as const,
		'traversedVariables' as const,
		'missingVariables' as const,
	]

	const evaluateResult = (
		Array.isArray(expressions) ? expressions : [expressions]).map(
		(expression) => {
			const [error, result] = catchError(() =>
				PickInObject(engine.evaluate(expression), keysKept),
			)

			return !error ? result : { error: { message: error.message }, warnings }
		},
	)

	return { evaluate: evaluateResult, warnings }
}
