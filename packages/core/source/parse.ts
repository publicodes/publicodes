import nearley from 'nearley'
import { ASTNode } from './AST/types'
import { EngineError, InternalError, syntaxError } from './error'
import grammar from './grammar'
import abattement from './mecanisms/abattement'
import applicable from './mecanisms/applicable'
import arrondi from './mecanisms/arrondi'
import avec from './mecanisms/avec'
import barème from './mecanisms/barème'
import { decompose } from './mecanisms/composantes'
import condition from './mecanisms/condition'
import durée from './mecanisms/durée'
import {
	parseEstApplicable,
	parseEstDéfini,
	parseEstNonDéfini,
} from './mecanisms/est'
import { parseEstNonApplicable } from './mecanisms/est-non-applicable'
import grille from './mecanisms/grille'
import { mecanismInversion } from './mecanisms/inversion'
import { parseMaximumDe, parseMinimumDe } from './mecanisms/max-min'
import nonApplicable from './mecanisms/non-applicable'
import { mecanismOnePossibility } from './mecanisms/one-possibility'
import operations from './mecanisms/operation'
import parDéfaut from './mecanisms/parDéfaut'
import plafond from './mecanisms/plafond'
import plancher from './mecanisms/plancher'
import produit from './mecanisms/product'
import { mecanismRecalcul } from './mecanisms/recalcul'
import résoudreRéférenceCirculaire from './mecanisms/résoudre-référence-circulaire'
import simplifierUnité from './mecanisms/simplifier-unité'
import situation from './mecanisms/situation'
import somme from './mecanisms/somme'
import { mecanismSynchronisation } from './mecanisms/synchronisation'
import tauxProgressif from './mecanisms/tauxProgressif'
import texte from './mecanisms/texte'
import toutesCesConditions from './mecanisms/toutes-ces-conditions'
import uneDeCesConditions from './mecanisms/une-de-ces-conditions'
import unité from './mecanisms/unité'
import variableManquante from './mecanisms/variablesManquantes'
import variations, { devariate } from './mecanisms/variations'
import { Context } from './parsePublicodes'
import parseReference from './reference'
import parseRule from './rule'

const { Grammar, Parser } = nearley

export default function parse(rawNode, context: Context): ASTNode {
	if (rawNode == undefined) {
		syntaxError(
			`
Une des valeurs de la formule est vide.
Vérifiez que tous les champs à droite des deux points sont remplis`,
			{ rule: context.dottedName }
		)
	}
	if (typeof rawNode === 'boolean') {
		syntaxError(
			`
Les valeurs booléennes true / false ne sont acceptées.
Utilisez leur contrepartie française : 'oui' / 'non'`,
			{ rule: context.dottedName }
		)
	}
	const node =
		typeof rawNode === 'object' ? rawNode : parseExpression(rawNode, context)
	if ('nodeKind' in node) {
		return node
	}
	if ('nom' in node) {
		return parseRule(node, context)
	}

	return {
		...parseChainedMecanisms(node, context),
		rawNode,
	}
}

const compiledGrammar = Grammar.fromCompiled(grammar)

function parseExpression(
	rawNode,
	context: Context
): Record<string, unknown> | undefined {
	/* Strings correspond to infix expressions.
	 * Indeed, a subset of expressions like simple arithmetic operations `3 + (quantity * 2)` or like `salary [month]` are more explicit that their prefixed counterparts.
	 * This function makes them prefixed operations. */
	const singleLineExpression = (rawNode + '').replace(/\s*\n\s*/g, ' ').trim()
	try {
		const [parseResult] = new Parser(compiledGrammar).feed(
			singleLineExpression
		).results

		if (parseResult == null) {
			throw new InternalError({
				expression: singleLineExpression,
				parseResult: `${JSON.stringify(parseResult)}`,
				notice:
					"L'erreur se situe très probablement dans le fichier `nearley.ne`",
			})
		}
		return parseResult
	} catch (e) {
		if (e instanceof InternalError) {
			throw e
		}
		syntaxError(
			`\`${singleLineExpression}\` n'est pas une expression valide`,
			{ rule: context.dottedName },
			e
		)
	}
}

function parseMecanism(rawNode, context: Context) {
	if (Array.isArray(rawNode)) {
		syntaxError(
			`
Il manque le nom du mécanisme pour le tableau : [${rawNode
				.map((x) => `'${x}'`)
				.join(', ')}]
Les mécanisme possibles sont : 'somme', 'le maximum de', 'le minimum de', 'toutes ces conditions', 'une de ces conditions'.
		`,
			{ rule: context.dottedName }
		)
	}

	const keys = Object.keys(rawNode)
	if (keys.length > 1) {
		syntaxError(
			`
Les mécanismes suivants se situent au même niveau : ${keys
				.map((x) => `'${x}'`)
				.join(', ')}
Cela vient probablement d'une erreur dans l'indentation
	`,
			{ rule: context.dottedName }
		)
	}
	if (keys.length === 0) {
		return { nodeKind: 'constant', nodeValue: undefined }
	}

	const mecanismName = Object.keys(rawNode)[0]
	const values = rawNode[mecanismName]
	const parseFn = parseFunctions[mecanismName]

	if (!parseFn) {
		syntaxError(
			`Le mécanisme "${mecanismName}" est inconnu.

Vérifiez qu'il n'y ait pas d'erreur dans l'orthographe du nom.`,
			{ rule: context.dottedName }
		)
	}
	try {
		// Mécanisme de composantes. Voir mécanismes.md/composantes
		if (values?.composantes) {
			return decompose(mecanismName, values, context)
		}
		if (values?.variations && Object.values(values).length > 1) {
			return devariate(mecanismName, values, context)
		}
		return parseFn(values, context)
	} catch (e) {
		if (e instanceof EngineError) {
			throw e
		}
		syntaxError(
			mecanismName
				? `➡️ Dans le mécanisme ${mecanismName}
${e.message}`
				: e.message,
			{ rule: context.dottedName }
		)
	}
}

// Chainable mecanisme in their composition order (first one is applyied first)
const chainableMecanisms = [
	variableManquante,
	avec,
	applicable,
	nonApplicable,
	arrondi,
	unité,
	simplifierUnité,
	plancher,
	plafond,
	parDéfaut,
	situation,
	résoudreRéférenceCirculaire,
	abattement,
]
function parseChainedMecanisms(rawNode, context: Context): ASTNode {
	const parseFn = chainableMecanisms.find((fn) => fn.nom in rawNode)
	if (!parseFn) {
		return parseMecanism(rawNode, context)
	}
	const { [parseFn.nom]: param, ...valeur } = rawNode

	return parseMecanism(
		{
			[parseFn.nom]: {
				valeur,
				[parseFn.nom]: param,
			},
		},
		context
	)
}

const parseFunctions = {
	...operations,
	...chainableMecanisms.reduce((acc, fn) => ({ [fn.nom]: fn, ...acc }), {}),
	'inversion numérique': mecanismInversion,
	'le maximum de': parseMaximumDe,
	'le minimum de': parseMinimumDe,
	'taux progressif': tauxProgressif,
	'toutes ces conditions': toutesCesConditions,
	'est non défini': parseEstNonDéfini,
	'est non applicable': parseEstNonApplicable,
	'est applicable': parseEstApplicable,
	'est défini': parseEstDéfini,
	'une de ces conditions': uneDeCesConditions,
	'une possibilité': mecanismOnePossibility,
	condition,
	barème,
	durée,
	grille,
	multiplication: produit,
	produit,
	recalcul: mecanismRecalcul,
	somme,
	synchronisation: mecanismSynchronisation,
	[texte.nom]: texte,
	valeur: parse,
	variable: parseReference,
	variations,
	objet: (v) => ({
		type: 'objet',
		nodeValue: v,
		missingVariables: {},
		nodeKind: 'constant',
	}),
	constant: (v) => ({
		type: v.type,
		// In the documentation we want to display constants defined in the source
		// with their full precision. This is especially useful for percentages like
		// APEC 0,036 %.
		fullPrecision: true,
		isNullable: v.nodeValue == null,
		missingVariables: {},
		nodeValue: v.nodeValue,
		nodeKind: 'constant',
	}),
}

export const mecanismKeys = Object.keys(parseFunctions)
