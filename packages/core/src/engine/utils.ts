import { ASTNode, EvaluatedNode } from '../AST/types'
import { serializeUnit } from '../units'

/**
 * Check if the value from a mutliple choices question `dottedName`
 * is defined as a rule `dottedName . value` in the model.
 * If not, the value in the situation is an old option,
 * that is not an option anymore.
 *  */
export function isAValidOption(
	possibleChoices: Array<ASTNode>,
	value: EvaluatedNode,
): boolean {
	if (value.nodeValue === undefined || value.nodeValue === null) {
		return true
	}
	const choice = possibleChoices.find((choice) => {
		if (choice.nodeKind === 'reference') {
			return choice.dottedName?.endsWith(value.nodeValue as string)
		}
		if (choice.nodeKind === 'constant') {
			if (choice.type === 'number' && 'unit' in choice) {
				return (
					(!value.unit ||
						serializeUnit(choice.unit) === serializeUnit(value.unit)) &&
					choice.nodeValue === value.nodeValue
				)
			}
			return choice.nodeValue === value.nodeValue && !('unit' in value)
		}
		// TODO Allow to replace reference in possibleChoices
		return false
	})

	return !!choice
}
