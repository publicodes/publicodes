import { describe, test, expect, beforeAll } from 'bun:test'
import { p, TestPublicodes, yaml } from './compile'

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
		const result = r['no parameters needed'].evaluate()
		expect(result.needed).toEqual([])
		expect(result.missing).toEqual([])
	})

	test('params a needed', () => {
		const result = r['params a needed'].evaluate()
		expect(result.needed).toEqual(['params . a'])
		expect(result.missing).toEqual(['params . a'])

		const resultWithA = r['params a needed'].evaluate({
			'params . a': 3,
		})
		expect(resultWithA.needed).toEqual(['params . a'])
		expect(resultWithA.missing).toEqual([])
	})

	test('params a and b needed', () => {
		const result = r['params a and b needed'].evaluate()
		expect(result.needed).toEqual(['params . a', 'params . b'])
		expect(result.missing).toEqual(['params . a', 'params . b'])

		const resultWithA = r['params a and b needed'].evaluate({
			'params . a': 3,
		})
		expect(resultWithA.needed).toEqual(['params . a', 'params . b'])
		expect(resultWithA.missing).toEqual(['params . b'])
	})

	test('conditionnal', () => {
		const result = r.conditionnal.evaluate()
		expect(result.needed).toEqual(['params . c', 'params . a'])
		expect(result.missing).toEqual(['params . c', 'params . a'])

		const resultWithA = r.conditionnal.evaluate({
			'params . c': false,
		})
		expect(resultWithA.needed).toEqual(['params . c', 'params . b'])
		expect(resultWithA.missing).toEqual(['params . b'])
	})

	test('with context', () => {
		expect(r['with context'].evaluate()).toEqual({
			missing: [],
			needed: [],
			trace: {},
			value: 9,
		})
	})

	test('with embeded context', () => {
		expect(r['with embeded context'].evaluate()).toEqual({
			missing: ['params . a'],
			needed: ['params . a'],
			trace: {},
			value: p.NotDefined,
		})

		expect(r['with embeded context'].evaluate({ 'params . a': 4 })).toEqual({
			missing: [],
			needed: ['params . a'],
			trace: {},
			value: 17,
		})
	})

	test('with embeded context', () => {
		expect(r['with constant'].evaluate()).toEqual({
			missing: [],
			needed: [],
			trace: {},
			value: 6,
		})
	})

	test('with trace', () => {
		expect(
			r['with embeded context'].evaluate({ 'params . a': 4 }, { trace: true }),
		).toEqual({
			missing: [],
			needed: ['params . a'],
			trace: {
				'10abf6c7f2c16c679b3f7d350545fa68': 5,
				'1a5e4f036660d14f63a03caa44481737': 9,
				'4993b6f5850367af3d444421a3409f9a': 17,
				'5b1a88402d83812e5788bc921af8bc01': 8,
				'66949866d332f6ff155f582874dcd2a6': 9,
				'7550cfb124972996fad946b6db00e232': 4,
				'861b8269b686ac199002e3c33e7d4bd9': 4,
				'8885e743e306fba608d1f3dc1e89e1d0': 2,
				a50700c71e4a5e4b8d3094e40d0f00f9: 4,
				c6840802b288f3af441975e12cc3875e: 9,
			},
			value: 17,
		})
	})
})
