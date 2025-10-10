import { describe, test, expect } from 'bun:test'
import { TestPublicodes, yaml } from '../utils/compile'
import { env } from 'bun'

describe('Needed parameters', async () => {
	let engine: TestPublicodes = await yaml`
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
`

	test('no parameters needed', () => {
		const result = engine.evaluate('no parameters needed')
		expect(result.neededParameters).toEqual([])
		expect(result.missingParameters).toEqual([])
	})

	test('params a needed', () => {
		const result = engine.evaluate('params a needed')
		expect(result.neededParameters).toEqual(['params . a'])
		expect(result.missingParameters).toEqual(['params . a'])

		const resultWithA = engine.evaluate('params a needed', { 'params . a': 3 })
		expect(resultWithA.neededParameters).toEqual(['params . a'])
		expect(resultWithA.missingParameters).toEqual([])
	})

	// NOTE: this is not working with the JS compiled engine because the all
	// binary operations are lazy, so if the first parameter is missing (i.e.
	// `undefined`), the second one is not evaluated at all and the value is
	// `undefined`. Do we want to keep this behavior?
	test.skipIf(env.OUTPUT_TYPE === 'js')('params a and b needed', () => {
		const result = engine.evaluate('params a and b needed')
		expect(result.neededParameters).toEqual(['params . a', 'params . b'])
		expect(result.missingParameters).toEqual(['params . a', 'params . b'])

		const resultWithA = engine.evaluate('params a and b needed', {
			'params . a': 3,
		})
		expect(resultWithA.neededParameters).toEqual(['params . a', 'params . b'])
		expect(resultWithA.missingParameters).toEqual(['params . b'])
	})

	test('conditionnal', () => {
		const result = engine.evaluate('conditionnal')
		expect(result.neededParameters).toEqual(['params . c', 'params . a'])
		expect(result.missingParameters).toEqual(['params . c', 'params . a'])

		const resultWithA = engine.evaluate('conditionnal', {
			'params . c': false,
		})
		expect(resultWithA.neededParameters).toEqual(['params . c', 'params . b'])
		expect(resultWithA.missingParameters).toEqual(['params . b'])
	})

	test('with context', () => {
		expect(engine.evaluate('with context')).toEqual({
			missingParameters: [],
			neededParameters: [],
			value: 9,
		})
	})

	test('with embeded context', () => {
		expect(engine.evaluate('with embeded context')).toEqual({
			missingParameters: ['params . a'],
			neededParameters: ['params . a'],
			value: undefined,
		})

		expect(
			engine.evaluate('with embeded context', { 'params . a': 4 }),
		).toEqual({
			missingParameters: [],
			neededParameters: ['params . a'],
			value: 17,
		})
	})
})
