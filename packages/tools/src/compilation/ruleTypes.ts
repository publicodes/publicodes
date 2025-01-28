import Engine from 'publicodes'

export type RuleType =
	| {
			type: 'number' | 'date' | 'boolean' | 'string'
			isNullable?: boolean
	  }
	| {
			type: 'enum'
			options: string[]
			isNullable?: boolean
	  }

/**
 * Resolve the type for each rule in the parsed rules.
 *
 * @param parsedRules The parsed rules that come from a Publicodes engine.
 * @returns A record with the rule name as key and the type as value.
 */
export function resolveRuleTypes<RuleName extends string = string>(
	engine: Engine<RuleName>,
): Record<string, RuleType> {
	const parsedRules = engine.getParsedRules()
	const ruleTypes: Record<RuleName, RuleType> = {} as any

	for (const ruleName in parsedRules) {
		const rule = parsedRules[ruleName]
		const ruleType = engine.context.nodesTypes.get(rule)
		const possibilities = engine.getPossibilitiesFor(ruleName)

		if (possibilities) {
			ruleTypes[ruleName] = {
				type: 'enum',
				options: possibilities.map(({ nodeValue }) => nodeValue.toString()),
				isNullable: ruleType?.isNullable,
			}
		} else if (ruleType?.type === undefined) {
			// Empty rule are considered as boolea
			// NOTE: Should we consider a different type for empty rules?
			ruleTypes[ruleName] = {
				type: 'boolean',
				isNullable: ruleType?.isNullable,
			}
		} else {
			ruleTypes[ruleName] = {
				type: ruleType.type,
				isNullable: ruleType.isNullable,
			}
		}
	}

	return ruleTypes
}
