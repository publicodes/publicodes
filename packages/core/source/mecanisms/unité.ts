import { ASTNode, Unit } from '../AST/types'
import { warning, PublicodesError } from '../error'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'
import { convertUnit, parseUnit } from '../units'

export type UnitéNode = {
	unit: Unit
	explanation: ASTNode
	nodeKind: 'unité'
}

export default function parseUnité(v, context): UnitéNode {
	const explanation = parse(v.valeur, context)

	const unité = v.unité

	const spaceBeforeOrAfterSlashOrDot = /\s[\/\.]|[\/\.]\s/

	if (unité.trim().match(spaceBeforeOrAfterSlashOrDot)) {
		throw new PublicodesError(
			'SyntaxError',
			`L'unité "${unité}" contient des espaces.
Les unités doivent être écrites sans espace, utilisez "${unité.replace(
				/\s/g,
				''
			)}" à la place.`,
			{ dottedName: context.dottedName }
		)
	}

	const unit = parseUnit(v.unité, context.units)

	return {
		explanation,
		unit,
		nodeKind: parseUnité.nom,
	}
}

parseUnité.nom = 'unité' as const

registerEvaluationFunction(parseUnité.nom, function evaluate(node) {
	const valeur = this.evaluateNode(node.explanation)

	let nodeValue = valeur.nodeValue
	if (nodeValue !== null && 'unit' in node) {
		try {
			nodeValue = convertUnit(
				valeur.unit,
				node.unit,
				valeur.nodeValue as number
			)
		} catch (e) {
			warning(
				this.context.logger,
				"Erreur lors de la conversion d'unité explicite",
				{ dottedName: this.cache._meta.evaluationRuleStack[0] },
				e
			)
		}
	}

	return {
		...node,
		nodeValue,
		explanation: valeur,
		missingVariables: valeur.missingVariables,
	}
})
