import type Engine from 'publicodes'
import type { PublicodesExpression, Situation } from 'publicodes'

/**
 * Convert input value from DOM change event to publicodes expression that can be used to update the engine situation.
 *
 * This function has no side effect. It will NOT update the engine situation, it will only return the value.
 * @see {@link updateSituationWithInputValue} to update the engine situation.
 *
 * @exemple
 * For example, a date input emit an event with a value of '2021-02-01'.
 * We can use this function to convert it to a string in the format '01/02/2021' which is the format used in publicodes.
 *
 *
 * @param engine: Engine, necessary to get information about the type of the rule to allow proper conversion.
 * @param dottedName: Name of the rule to update
 * @param value : Value to convert.
 * @returns PublicodesExpression | undefined
 */
export function convertInputValueToPublicodes<Name extends string>(
	engine: Engine<Name>,
	dottedName: Name,
	value: string | number | boolean | undefined,
): PublicodesExpression | undefined {
	const rule = engine.getRule(dottedName)
	const typeInfo = engine.context.nodesTypes.get(rule)
	let situationValue: Situation<Name>[Name]

	if (value === '' || value === undefined) {
		return undefined
	}

	if (typeof value === 'boolean') {
		situationValue = value ? 'oui' : 'non'
	} else if (typeInfo?.type === 'string') {
		situationValue = `'${value.toString()}'`
	} else if (typeInfo?.type === 'date') {
		situationValue = new Date(value)
			.toISOString()
			.split('T')[0]
			.split('-')
			.reverse()
			.join('/')
	} else {
		situationValue = value
	}

	return situationValue
}
