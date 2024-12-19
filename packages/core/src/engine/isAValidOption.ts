import { Engine } from '.'
import { ASTNode, EvaluatedNode } from '../AST/types'
import { convertNodeToUnit } from '../nodeUnits'
import { UnePossibilitéNode } from '../parseUnePossibilité'
import { serializeUnit } from '../units'

/**
 * Check if the value from a mutliple choices question `dottedName`
 * is defined as a rule `dottedName . value` in the model.
 * If not, the value in the situation is an old option,
 * that is not an option anymore.
 *  */
export function isAValidOption(
	engine: Engine,
	possibilités: UnePossibilitéNode,
	value: EvaluatedNode,
): boolean {
	if (value.nodeValue === undefined || value.nodeValue === null) {
		return true
	}
	switch (possibilités.type) {
		case 'number':
			return possibilités.explanation.some((possibility) => {
				if (possibility.unit) {
					return (
						convertNodeToUnit(possibility.unit, value).nodeValue ===
						value.nodeValue
					)
				}
				return possibility.nodeValue === value.nodeValue
			})
		case 'string':
			return possibilités.values.includes(`'${value.nodeValue}'`)
		case 'reference': {
			const evaluatedPossibilités = engine.evaluateNode(possibilités)
			return evaluatedPossibilités.values.includes(`'${value.nodeValue}'`)
		}
	}
}
