import { describe, it, expect, beforeAll } from 'bun:test'
import Publicodes from '../src/index'

describe('Traversed variables - Basics', () => {
	let engine

	beforeAll(() => {
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
		expect(engine.evaluate('5 + 5').traversedVariables).toEqual([])
	})

	it('should countain single rule if it has no dependency', () => {
		expect(engine.evaluate('a').traversedVariables).toEqual(['a'])
	})

	it('should not be polluted by previous evaluations', () => {
		expect(engine.evaluate('a').traversedVariables).toEqual(['a'])
		engine.evaluate('d')
		expect(engine.evaluate('d').traversedVariables).toEqual(['d', 'e'])
	})

	it('should contain simple dependency', () => {
		expect(engine.evaluate('b').traversedVariables).toEqual(['b', 'a'])
	})

	it('should contain simple dependency without duplication', () => {
		expect(engine.evaluate('c').traversedVariables).toEqual(['c', 'a'])
	})

	it('should not be polluted by previous term in an operation', () => {
		engine.evaluate('branches')
		expect(engine.evaluate('f').traversedVariables).toEqual(['f', 'g'])
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
		expect(engine.evaluate('brut').nodeValue).toEqual(2000)
		expect(engine.evaluate('brut').traversedVariables).toEqual([
			'brut',
			'net',
			'forfait',
		])
	})
})
