import { expect } from 'chai'
import { cyclesInDependenciesGraph } from '../src/AST/graph'
import { parseYaml } from './utils'

// Cycles due to parents dependencies are not handled currently.
describe.skip('Cyclic dependencies detectron 3000 ™', function () {
	it('should detect the trivial formule cycle', function () {
		const rules = parseYaml`
			a:
				formule: a + 1
		`
		const cycles = cyclesInDependenciesGraph(rules)
		expect(cycles).to.deep.equal([['a']])
	})

	it('should detect nested and parallel formule cycles', function () {
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

	it('should not detect formule cycles due to parent dependency', function () {
		const rules = parseYaml`
			a:
				formule: b + 1
			a . b:
				formule: 3
		`
		const cycles = cyclesInDependenciesGraph(rules)
		expect(cycles).to.deep.equal([])
	})

	it('should not detect cycles when résoudre référence circulaire', function () {
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
