import { describe, test, expect, beforeAll } from 'bun:test'
import { TestPublicodes, yaml } from './compile'

describe('Needed parameters', () => {
	let r: TestPublicodes
	beforeAll(async () => {
		r = await yaml`
params:
  avec:
    a:
      type: nombre
    b:
      type: nombre
    c:
      par défaut: oui

no parameters needed:
  valeur: 10

params a needed:
  valeur: params . a + 5

params a and b needed:
  valeur: params . a + params . b

conditionnal:
  valeur:
    variations:
      - si: params . c
        alors: params . a
      - sinon: params . b

with context:
  valeur: params a needed
  contexte:
    params . a: 4

with embeded context:
  valeur:
    somme:
      - params . a * 2
      - valeur: params a needed
        contexte:
          params . a: 4

with constant:
  valeur: constant + 2
  contexte:
    constant: 4
  avec:
   constant: 10
`
	})

	test('no parameters needed', () => {
		const result = r['no parameters needed'].evaluateParams()
		expect(result.needed).toEqual([])
		expect(result.missing).toEqual([])
	})

	test('params a needed', () => {
		const result = r['params a needed'].evaluateParams()
		expect(result.needed).toEqual(['params . a'])
		expect(result.missing).toEqual(['params . a'])

		const resultWithA = r['params a needed'].evaluateParams({
			'params . a': 3,
		})
		expect(resultWithA.needed).toEqual(['params . a'])
		expect(resultWithA.missing).toEqual([])
	})

	test('params a and b needed', () => {
		const result = r['params a and b needed'].evaluateParams()
		expect(result.needed).toEqual(['params . a', 'params . b'])
		expect(result.missing).toEqual(['params . a', 'params . b'])

		const resultWithA = r['params a and b needed'].evaluateParams({
			'params . a': 3,
		})
		expect(resultWithA.needed).toEqual(['params . a', 'params . b'])
		expect(resultWithA.missing).toEqual(['params . b'])
	})

	test('conditionnal', () => {
		const result = r.conditionnal.evaluateParams()
		expect(result.needed).toEqual(['params . c', 'params . a'])
		expect(result.missing).toEqual(['params . c', 'params . a'])

		const resultWithA = r.conditionnal.evaluateParams({
			'params . c': false,
		})
		expect(resultWithA.needed).toEqual(['params . c', 'params . b'])
		expect(resultWithA.missing).toEqual(['params . b'])
	})

	test('with context', () => {
		expect(r['with context'].evaluateParams()).toEqual({
			missing: [],
			needed: [],
			value: 9,
		})
	})

	test('with embeded context', () => {
		expect(r['with embeded context'].evaluateParams()).toEqual({
			missing: ['params . a'],
			needed: ['params . a'],
			value: undefined,
		})

		expect(
			r['with embeded context'].evaluateParams({ 'params . a': 4 }),
		).toEqual({
			missing: [],
			needed: ['params . a'],
			value: 17,
		})
	})

	test('with embeded context', () => {
		expect(r['with constant'].evaluateParams()).toEqual({
			missing: [],
			needed: [],
			value: 6,
		})
	})
})
