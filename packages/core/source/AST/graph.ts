import parsePublicodes from '../parsePublicodes'
import { findCycles, Graph } from './findCycles'

type GraphCycles = string[][]

function buildDependenciesGraph(rulesDeps: Record<string, Array<string>>) {
	const g = new Graph()
	Object.entries(rulesDeps).forEach(([ruleDottedName, dependencies]) => {
		dependencies.forEach((depDottedName) => {
			g.setEdge(ruleDottedName, depDottedName)
		})
	})
	return g
}

type RawRules = Parameters<typeof parsePublicodes>[0]

export function cyclesInDependenciesGraph(rawRules: RawRules): GraphCycles {
	const { rulesDependencies } = parsePublicodes(rawRules)
	const dependenciesGraph = buildDependenciesGraph(rulesDependencies)
	const cycles = findCycles(dependenciesGraph)

	return cycles.map((c) => c.reverse())
}

/**
 * Make the cycle as small as possible.
 */
export function squashCycle(
	rulesDependenciesObject: Record<string, string[]>,
	cycle: string[]
): string[] {
	function* loopFrom(i: number) {
		let j = i
		while (true) {
			yield cycle[j++ % cycle.length]
		}
	}
	const smallCycleStartingAt: string[][] = []
	for (let i = 0; i < cycle.length; i++) {
		const smallCycle: string[] = []
		let previousVertex: string | undefined = undefined
		for (const vertex of loopFrom(i)) {
			if (previousVertex === undefined) {
				smallCycle.push(vertex)
				previousVertex = vertex
			} else if (rulesDependenciesObject[previousVertex].includes(vertex)) {
				if (smallCycle.includes(vertex)) {
					smallCycle.splice(0, smallCycle.lastIndexOf(vertex))
					break
				}
				smallCycle.push(vertex)
				previousVertex = vertex
			}
		}
		smallCycleStartingAt.push(smallCycle)
	}

	const smallest = smallCycleStartingAt.reduce((minCycle, someCycle) =>
		someCycle.length > minCycle.length ? minCycle : someCycle
	)
	return smallest
}

/**
 * This function is useful so as to print the dependencies at each node of the
 * cycle.
 * ⚠️  Indeed, the findCycles function returns the cycle found using the
 * Tarjan method, which is **not necessarily the smallest cycle**. However, the
 * smallest cycle is more readable.
 */
export function cyclicDependencies(
	rawRules: RawRules
): [GraphCycles, string[]] {
	const { rulesDependencies } = parsePublicodes(rawRules)
	const dependenciesGraph = buildDependenciesGraph(rulesDependencies)
	const cycles = findCycles(dependenciesGraph)

	const reversedCycles = cycles.map((c) => c.reverse())

	const smallCycles = reversedCycles.map((cycle) =>
		squashCycle(rulesDependencies, cycle)
	)

	const printableStronglyConnectedComponents = reversedCycles.map((c, i) =>
		printInDotFormat(dependenciesGraph, c, smallCycles[i])
	)

	return [smallCycles, printableStronglyConnectedComponents]
}

/**
 * Is edge in the cycle, in the same order?
 */
const edgeIsInCycle = (cycle: string[], v: string, w: string): boolean => {
	for (let i = 0; i < cycle.length + 1; i++) {
		if (v === cycle[i] && w === cycle[(i + 1) % cycle.length]) return true
	}
	return false
}

export function printInDotFormat(
	dependenciesGraph: Graph,
	cycle: string[],
	subCycleToHighlight: string[]
) {
	const edgesSet = new Set()
	cycle.forEach((vertex) => {
		dependenciesGraph
			.outEdges(vertex)
			.filter(({ w }) => cycle.includes(w))
			.forEach(({ v, w }) => {
				edgesSet.add(
					`"${v}" -> "${w}"` +
						(edgeIsInCycle(subCycleToHighlight, v, w) ? ' [color=red]' : '')
				)
			})
	})
	return `digraph Cycle {\n\t${[...edgesSet].join(';\n\t')};\n}`
}
