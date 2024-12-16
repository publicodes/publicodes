import Engine, { utils } from 'publicodes'

export type PageOptions = {
	depth?: number
}

export function computeNextFields<Name extends string>(
	engine: Engine<Name>,
	targets: Array<Name>,
	seenFields: Array<Name> = [],
) {
	const missings = engine.evaluate({
		somme: targets,
	}).missingVariables
	const sortedRules = Object.entries(missings)
		.filter(([dottedName]) => !seenFields.includes(dottedName as Name))
		.sort(([, score1], [, score2]) => {
			return score2 - score1
		})
		.map(([dottedName]) => dottedName as Name)
	return sortedRules
}

export function createNextPage<Name extends string>(
	nextFields: Array<Name>,
	{ depth = 1 }: PageOptions,
) {
	if (nextFields.length === 0) {
		return []
	}

	return nextFields.filter((dottedName) => {
		const commonAncestor = utils.findCommonAncestor(dottedName, nextFields[0])
		if (!commonAncestor) {
			return false
		}
		const ancestorDepth = commonAncestor.split(' . ').length
		return ancestorDepth >= depth
	})
}

export function countNextPages<Name extends string>(
	nextFields: Array<Name>,
): number {
	return new Set(nextFields.map((dottedName) => dottedName.split(' . ')[0]))
		.size
}
