import Engine from '.'
import { Situation } from '..'
import { parseExpression } from '../parseExpression'

/**
 * Check if the value from a mutliple choices question `dottedName`
 * is defined as a rule `dottedName . value` in the model.
 * If not, the value in the situation is an old option,
 * that is not an option anymore.
 *  */
export function isAValidOption<Name extends string>(
	engine: Engine<Name>,
	dottedName: Name,
	value: Situation<Name>[Name],
) {
	const parsedSituationExpr =
		typeof value === 'string' ? parseExpression(value, dottedName) : undefined

	return !(
		parsedSituationExpr &&
		'constant' in parsedSituationExpr &&
		parsedSituationExpr.constant.type === 'string' &&
		!(
			`${dottedName} . ${parsedSituationExpr.constant.nodeValue}` in
			engine.getParsedRules()
		) &&
		engine.getParsedRules()[dottedName].explanation?.valeur?.rawNode?.[
			'une possibilité'
		]
	)
}
