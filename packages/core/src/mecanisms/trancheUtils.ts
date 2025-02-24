import Engine from '..'
import { ASTNode, Evaluation } from '../AST/types'
import { PublicodesError, warning } from '../error'
import { mergeAllMissing } from '../evaluationUtils'
import parse from '../parse'
import { convertUnit, inferUnit } from '../units'

type TrancheNode = { taux: ASTNode } | { montant: ASTNode }
export type TrancheNodes = Array<
	TrancheNode & { plafond?: ASTNode; isActive?: boolean }
>

export const parseTranches = (tranches, context): TrancheNodes => {
	return tranches.map((node, i) => {
		if (!node.plafond && i > tranches.length) {
			throw new PublicodesError(
				'SyntaxError',
				`La tranche n°${i} du barème n'a pas de plafond précisé. Seule la dernière tranche peut ne pas être plafonnée`,
				{ dottedName: '' },
			)
		}
		return {
			...node,
			...(node.taux !== undefined ? { taux: parse(node.taux, context) } : {}),
			...(node.montant !== undefined ?
				{ montant: parse(node.montant, context) }
			:	{}),
			plafond:
				'plafond' in node ?
					parse(node.plafond, context)
				:	{
						nodeValue: Infinity,
						nodeKind: 'constant',
						type: 'number',
						isNullable: false,
					},
		}
	})
}

export function evaluatePlafondUntilActiveTranche(
	this: Engine,
	{ multiplicateur, assiette, parsedTranches },
) {
	return parsedTranches.reduce(
		([tranches, activeTrancheFound], parsedTranche, i: number) => {
			if (activeTrancheFound) {
				return [
					[...tranches, { ...parsedTranche, isAfterActive: true }],
					activeTrancheFound,
				]
			}

			const plafond = this.evaluateNode(parsedTranche.plafond)
			const plancher =
				tranches[i - 1] ? tranches[i - 1].plafond : { nodeValue: 0 }

			let plafondValue: Evaluation<number> =
				(
					plafond.nodeValue === undefined ||
					multiplicateur.nodeValue === undefined
				) ?
					undefined
				:	plafond.nodeValue * multiplicateur.nodeValue

			try {
				plafondValue =
					plafondValue === Infinity || plafondValue === 0 ?
						plafondValue
					:	convertUnit(
							inferUnit('*', [plafond.unit, multiplicateur.unit]),
							assiette.unit,
							plafondValue,
						)
			} catch (e) {
				if (!(e instanceof Error)) {
					throw e
				}
				warning(
					this.context,
					`L'unité du plafond de la tranche n°${
						i + 1
					}  n'est pas compatible avec celle l'assiette`,
					'unitConversion',
					e,
				)
			}
			const plancherValue = tranches[i - 1] ? tranches[i - 1].plafondValue : 0
			const isAfterActive =
				plancherValue === undefined || assiette.nodeValue === undefined ?
					undefined
				:	plancherValue > assiette.nodeValue

			const calculationValues = [plafond, assiette, multiplicateur, plancher]
			if (calculationValues.some((node) => node.nodeValue === undefined)) {
				return [
					[
						...tranches,
						{
							...parsedTranche,
							plafond,
							plafondValue,
							plancherValue,
							nodeValue: undefined,
							isActive: undefined,
							isAfterActive,
							missingVariables: mergeAllMissing(calculationValues),
						},
					],
					false,
				]
			}

			if (
				!!tranches[i - 1] &&
				!!plancherValue &&
				(plafondValue as number) <= plancherValue
			) {
				throw new PublicodesError(
					'EvaluationError',
					`Le plafond de la tranche n°${
						i + 1
					} a une valeur inférieure à celui de la tranche précédente`,
					{ dottedName: this.cache._meta.evaluationRuleStack[0] },
				)
			}

			const tranche = {
				...parsedTranche,
				plafond,
				plancherValue,
				plafondValue,
				isAfterActive,
				isActive:
					assiette.nodeValue >= plancherValue &&
					assiette.nodeValue < (plafondValue as number),
			}

			return [[...tranches, tranche], tranche.isActive]
		},
		[[], false],
	)[0]
}
