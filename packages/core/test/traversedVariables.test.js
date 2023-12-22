import { expect } from 'chai'
import Publicodes from '../src/index'

describe('Traversed variables - Basics', () => {
	let engine
	before(() => {
		engine = new Publicodes({
			a: 1,
			b: '1 + a',
			c: '1 + a + a',
			d: 'e',
			e: 1,

			branches: 'b + f',
			f: 'g',
			g: 1,
		})
		engine.cache.traversedVariablesStack = []
	})
	it('should be empty if there are no external references', () => {
		expect(engine.evaluate('5 + 5').traversedVariables).to.deep.equal([])
	})
	it('should countain single rule if it has no dependency', () => {
		expect(engine.evaluate('a').traversedVariables).to.deep.equal(['a'])
	})
	it('should not be polluted by previous evaluations', () => {
		expect(engine.evaluate('a').traversedVariables).to.deep.equal(['a'])
		engine.evaluate('d')
		expect(engine.evaluate('d').traversedVariables).to.deep.equal(['d', 'e'])
	})
	it('should contain simple dependency', () => {
		expect(engine.evaluate('b').traversedVariables).to.deep.equal(['b', 'a'])
	})
	it('should contain simple dependency without duplication', () => {
		expect(engine.evaluate('c').traversedVariables).to.deep.equal(['c', 'a'])
	})
	it('should not be polluted by previous term in an operation', () => {
		engine.evaluate('branches')
		expect(engine.evaluate('f').traversedVariables).to.deep.equal(['f', 'g'])
	})
})

describe('Traversed variables - Inversions', () => {
	it('should ignore variables traversed only during the inversion search', () => {
		const engine = new Publicodes({
			brut: {
				'inversion numérique': {
					avec: ['net'],
				},
			},
			net: '0.6 * brut - forfait',
			forfait: {
				variations: [
					{
						si: 'brut > 2001',
						alors: 'ne doit pas être traversée si brut vaut 2000',
					},
					{
						si: 'brut < 1999',
						alors: 'ne doit pas être traversée si brut vaut 2000',
					},
					{ sinon: 200 },
				],
			},
			'ne doit pas être traversée si brut vaut 2000': 200,
		})

		engine.setSituation({ net: 1234 })
		engine.cache.traversedVariablesStack = []

		expect(engine.evaluate('brut').traversedVariables).to.include(
			'ne doit pas être traversée si brut vaut 2000',
		)

		engine.setSituation({ net: 1000 })
		engine.cache.traversedVariablesStack = []
		expect(engine.evaluate('brut').nodeValue).to.equal(2000)
		expect(engine.evaluate('brut').traversedVariables).to.deep.equal([
			'brut',
			'net',
			'forfait',
		])
	})
})
