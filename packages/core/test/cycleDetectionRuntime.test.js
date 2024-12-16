import { expect } from 'chai'
import { parseYaml } from './utils'
import Engine from '../src'

// Cycles due to parents dependencies are not handled currently.
describe('Cycle detection during runtime ', function () {
	const strictOptions = {
		strict: {
			noCycleRuntime: true,
		},
	}

	it('should detect the trivial cycle', function () {
		const rules = parseYaml`
			a: a + 1
		`
		const engine = new Engine(rules, strictOptions)
		expect(() => engine.evaluate('a')).to.throw()
	})

	it('should detect nested and parallel cycles', function () {
		const engine = new Engine(
			parseYaml`
			a: b + 1
			b: c + d + 1
			c: a + 1
			d: b + 1
		`,
			strictOptions,
		)

		expect(() => engine.evaluate('a')).to.throw()
	})

	it('should not detect valeur cycles due to parent dependency', function () {
		const engine = new Engine(
			parseYaml`
			a: b + 1
			a . b: 3
		`,
			strictOptions,
		)

		expect(() => engine.evaluate('a')).to.not.throw()
	})

	it('should not detect valeur cycles due to parent dependency with boolean value', function () {
		const engine = new Engine(
			parseYaml`
			a: b
			a . b: non
		`,
			strictOptions,
		)

		expect(() => engine.evaluate('a')).to.not.throw()
	})

	it('should not detect cycles when résoudre référence circulaire', function () {
		const engine = new Engine(
			parseYaml`
			fx: 200 - x
			x:
			    résoudre la référence circulaire: oui
			    valeur: fx
		`,
			strictOptions,
		)

		expect(() => engine.evaluate('x')).to.not.throw()
		expect(engine.evaluate('x').missingVariables).to.eql({})
	})
})
