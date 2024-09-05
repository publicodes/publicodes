import { reduceAST, type EvaluatedNode } from 'publicodes'
export function getPrecision(rule: EvaluatedNode<'rule'>) {
	if (typeof rule.nodeValue !== 'number') {
		return
	}
	const precision = reduceAST<undefined | number>(
		(acc, node) => {
			if ((node as EvaluatedNode).nodeValue !== rule.nodeValue) {
				return acc
			}
			if (node.nodeKind === 'constant') {
				return 20
			}
			if (node.nodeKind !== 'arrondi') {
				return
			}

			const precision = (node.explanation.arrondi as EvaluatedNode).nodeValue
			if (typeof precision === 'number') {
				return precision
			}
			if (precision === true) {
				return 0
			}
		},
		undefined,
		rule.explanation.valeur,
	)
	return precision
}
