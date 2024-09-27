import { Engine } from '.'
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
	const parsedRules = engine.getParsedRules()
	return !(
		parsedSituationExpr &&
		'constant' in parsedSituationExpr &&
		parsedSituationExpr.constant.type === 'string' &&
		!(
			`${dottedName} . ${parsedSituationExpr.constant.nodeValue}` in parsedRules
		) &&
		// We check on rawNode directly.
		// The alternative would be to browser the AST of the rule to find the 'une possibilité' node, but this works fine.
		(parsedRules[dottedName].rawNode?.['une possibilité'] ||
			parsedRules[dottedName].rawNode?.formule?.['une possibilité'] ||
			parsedRules[dottedName].rawNode?.valeur?.['une possibilité'])
	)
}
