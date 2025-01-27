import { Evaluation, PublicodesExpression, Situation } from 'publicodes'
import { getValueWithoutQuotes, RuleName } from '../commons'

/**
 * Associate a old value to a new value.
 */
export type ValueMigration = Record<string, string>

/**
 * Migration instructions. It contains the rules and values to migrate.
 */
export type Migration = {
  keysToMigrate: Record<RuleName, RuleName>
  valuesToMigrate: Record<RuleName, ValueMigration>
}

/**
 * Migrate a situation from an old version of a model to a new version
 * according to the provided migration instructions.
 *
 * @param situation - The situation object containing all answers for a given simulation.
 * @param instructions - The migration instructions object.
 *
 * @returns The migrated situation (and foldedSteps if specified).
 *
 * @example
 * ```typescript
 * import { migrateSituation } from '@publicodes/tools/migration'
 *
 * const situation = {
 *  "age": 25
 *  "job": "developer",
 *  "city": "Paris"
 * }
 *
 * const instructions = {
 *  keysToMigrate: {
 *    // The rule `age` will be renamed to `âge`.
 *    age: 'âge',
 *    // The rule `city` will be removed.
 *    city: ''
 *  },
 *  valuesToMigrate: {
 *    job: {
 *      // The value `developer` will be translated to `développeur`.
 *      developer: 'développeur'
 *    }
 *  }
 * }
 *
 * migrateSituation(situation, instructions) // { "âge": 25, "job": "'développeur'" }
 * ```
 *
 * @note An example of instructions can be found {@link https://github.com/incubateur-ademe/nosgestesclimat/blob/preprod/migration/migration.yaml | here}.
 */
export function migrateSituation(
  situation: Situation<RuleName>,
  instructions: Migration,
): Situation<RuleName> {
  let newSituation = { ...situation }
  const currentRules = Object.keys(situation)
  const valueKeysToMigrate = Object.keys(instructions.valuesToMigrate)

  Object.entries(situation).map(([rule, value]) => {
    handleSpecialCases(rule, value, newSituation)

    if (currentRules.includes(rule)) {
      updateKey(rule, value, newSituation, instructions.keysToMigrate[rule])
    }

    const formattedValue = getValueWithoutQuotes(value) ?? (value as string)
    const valuesMigration =
      instructions.valuesToMigrate[
        valueKeysToMigrate.find((key) => rule.includes(key))
      ] ?? {}
    const oldValuesName = Object.keys(valuesMigration)

    if (oldValuesName.includes(formattedValue)) {
      updateValue(rule, valuesMigration[formattedValue], newSituation)
    }
  })

  return newSituation
}

/**
 * Handle migration of old value format : an object { valeur: number, unité: string }.
 *
 * @example
 * ```json
 * { valeur: number, unité: string }
 * ```
 */
function handleSpecialCases(
  rule: RuleName,
  oldValue: PublicodesExpression,
  situation: Situation<RuleName>,
): void {
  // Special case, number store as a string, we have to convert it to a number
  if (
    oldValue &&
    typeof oldValue === 'string' &&
    !isNaN(parseFloat(oldValue))
  ) {
    situation[rule] = parseFloat(oldValue)
  }

  // Special case : wrong value format, legacy from previous publicodes version
  // handle the case where valeur is a string "2.33"
  if (oldValue && oldValue['valeur'] !== undefined) {
    situation[rule] =
      typeof oldValue['valeur'] === 'string' &&
      !isNaN(parseFloat(oldValue['valeur']))
        ? parseFloat(oldValue['valeur'])
        : (oldValue['valeur'] as number)
  }
  // Special case : other wrong value format, legacy from previous publicodes version
  // handle the case where nodeValue is a string "2.33"
  if (oldValue && oldValue['nodeValue'] !== undefined) {
    situation[rule] =
      typeof oldValue['nodeValue'] === 'string' &&
      !isNaN(parseFloat(oldValue['nodeValue']))
        ? parseFloat(oldValue['nodeValue'])
        : (oldValue['nodeValue'] as number)
  }
}

function updateKey(
  rule: RuleName,
  oldValue: PublicodesExpression,
  situation: Situation<RuleName>,
  ruleToMigrate: RuleName | undefined,
): void {
  if (ruleToMigrate === undefined) {
    return
  }

  delete situation[rule]

  if (ruleToMigrate !== '') {
    situation[ruleToMigrate] =
      typeof oldValue === 'object' ? (oldValue as any)?.valeur : oldValue
  }
}

function updateValue(
  rule: RuleName,
  value: string,
  situation: Situation<RuleName>,
): void {
  // The value is not a value to migrate and the key has to be deleted
  if (value === '') {
    delete situation[rule]
  } else {
    // The value is renamed and needs to be migrated
    situation[rule] =
      typeof value === 'string' && value !== 'oui' && value !== 'non'
        ? `'${value}'`
        : value
  }
}
