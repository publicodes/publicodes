import { expect } from 'chai'
import dedent from 'dedent-js'
import { cyclesInDependenciesGraph } from '../source/AST/graph'
import { parseYaml } from './utils'

// Cycles due to parents dependencies are not handled currently.
describe.skip('Cyclic dependencies detectron 3000 ™', () => {
	it('should detect the trivial formule cycle', () => {
		const rules = parseYaml`
			a:
				formule: a + 1
		`
		const cycles = cyclesInDependenciesGraph(rules)
		expect(cycles).to.deep.equal([['a']])
	})

	it('should detect nested and parallel formule cycles', () => {
		const rules = parseYaml`
			a:
				formule: b + 1
			b:
				formule: c + d + 1
			c:
				formule: a + 1
			d:
				formule: b + 1
		`
		const cycles = cyclesInDependenciesGraph(rules)
		expect(cycles).to.deep.equal([['a', 'b', 'c', 'd']])
	})

	it('should not detect formule cycles due to parent dependency', () => {
		const rules = parseYaml`
			a:
				formule: b + 1
			a . b:
				formule: 3
		`
		const cycles = cyclesInDependenciesGraph(rules)
		expect(cycles).to.deep.equal([])
	})

	it('should not detect cycles when résoudre référence circulaire', () => {
		const rules = parseYaml`
			fx:
				200 - x
			x:
				résoudre la référence circulaire: oui
				valeur: fx
		`
		const cycles = cyclesInDependenciesGraph(rules)
		expect(cycles).to.deep.equal([])
	})
})
