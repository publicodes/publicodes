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
				'1895674d36e8569705894b2f029b70a4': {
					'': 8,
				},
				'1d7e55ffacdb8389254bdebc7d7b988c': {
					'': 2,
				},
				'39b3251ee19960e2e3c238a224ae2287': {
					'-5d4c03eb5b788db0946631a4637269a0': 9,
				},
				'3c06d7acafdb25174872d39d496e86e3': {
					'': 4,
				},
				'5d4c03eb5b788db0946631a4637269a0': {
					'': 9,
				},
				'62ccf9eee6e17a8653626817218f80c2': {
					'': 4,
				},
				'844889c6987f7e1d65b03803e136a2b3': {
					'-5d4c03eb5b788db0946631a4637269a0': 9,
				},
				ba7f9cea0b9d6e6002ccfd0584474da2: {
					'-5d4c03eb5b788db0946631a4637269a0': 5,
				},
				e964863e018a23430efdff97c7a84029: {
					'-5d4c03eb5b788db0946631a4637269a0': 4,
				},
				f87c628430ebc9eb918ffb04025cb4a8: {
					'': 17,
				},
			},
			value: 17,
		})
	})
})
