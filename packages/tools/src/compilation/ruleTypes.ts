import Engine, { ASTNode, reduceAST, RuleNode } from 'publicodes'

export type RuleType =
  | {
      type: 'number' | 'date' | 'boolean' | 'string'
      isNullable: boolean
    }
  | {
      type: 'enum'
      options: string[]
      isNullable: boolean
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

    if (ruleType?.type === undefined) {
      // Empty rule are considered as boolean
      // NOTE: Should we consider a different type for empty rules?
      ruleTypes[ruleName] = {
        type: 'boolean',
        isNullable: ruleType.isNullable,
      }
    } else if (ruleType.type === 'string') {
      // Most of the time, a string rule is an enumeration
      const options = collectOptions(rule)

      if (options !== undefined) {
        ruleTypes[ruleName] = {
          type: 'enum',
          options,
          isNullable: ruleType.isNullable,
        }
      } else {
        ruleTypes[ruleName] = {
          type: 'string',
          isNullable: ruleType.isNullable,
        }
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

/**
 * Returns the list of all options of a rule if it contains a `une possibilité`
 * mechanism.
 */
export function collectOptions(rule: RuleNode): string[] | undefined {
  return reduceAST(
    (_, node: ASTNode) => {
      if (node.nodeKind === 'une possibilité') {
        return node['possibilités']
      }
    },
    undefined,
    rule,
  )
}
