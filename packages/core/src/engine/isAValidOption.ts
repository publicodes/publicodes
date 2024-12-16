import { Engine } from '.'
import { ASTNode, EvaluatedNode } from '../AST/types'
import { convertNodeToUnit } from '../nodeUnits'
import { UnePossibilitéNode } from '../mecanisms/unePossibilité'

/**
 * Check if the value from a mutliple choices question `dottedName`
 * is defined as a rule `dottedName . value` in the model.
 * If not, the value in the situation is an old option,
 * that is not an option anymore.
 *  */
export function isAValidOption(
	engine: Engine,
	possibilities: UnePossibilitéNode,
	value: EvaluatedNode,
): boolean {
	if (value.nodeValue === undefined || value.nodeValue === null) {
		return true
	}
	switch (possibilities.type) {
		case 'number':
			return possibilities.explanation.some((possibility) => {
				if ('unit' in possibility) {
					return (
						convertNodeToUnit(possibility.unit, value).nodeValue ===
						possibility.nodeValue
					)
				}
				return (
					(possibility as ASTNode<'constant'>).nodeValue === value.nodeValue
				)
			})
		case 'string':
			return possibilities.explanation.some(
				(n) => n.publicodesValue === `'${value.nodeValue}'`,
			)
		case 'reference': {
			const evaluatedPossibilités = engine.evaluateNode(possibilities)
			return evaluatedPossibilités.explanation.some(
				(n) =>
					n.publicodesValue === `'${value.nodeValue}'` &&
					(n.notApplicable as EvaluatedNode).nodeValue !== true,
			)
		}
	}
}
