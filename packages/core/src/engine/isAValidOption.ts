/**
 * Validates if a given value is a valid option according to the defined possibilities.
 *
 * @param engine - The Publicodes engine instance
 * @param possibilities - Node representing a "une possibilité" mechanism containing possible values
 * @param value - The node containing the value to validate
 *
 * @returns boolean - True if the value is valid according to the possibilities, false otherwise
 *
 * The validation rules differ based on the type of possibilities:
 * - For numbers: Checks if value matches any possibility (considering unit conversion)
 * - For strings: Checks if value matches any possibility's publicodes representation
 * - For references: Checks if value matches any applicable possibility
 *
 * Note: undefined or null values are always considered valid
 */
import { Engine } from '.'
import { ASTNode, EvaluatedNode } from '../AST/types'
import { convertNodeToUnit } from '../nodeUnits'
import { UnePossibilitéNode } from '../mecanisms/unePossibilité'

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
