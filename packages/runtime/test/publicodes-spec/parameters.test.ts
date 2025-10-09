import { describe, test, expect } from 'bun:test'
import { TestPublicodes, yaml } from '../utils/compile'

describe('Needed parameters', async () => {
	let engine: TestPublicodes = await yaml`
no parameters needed:
  valeur: 10

params:

params . a:
  type: nombre

params a needed:
  valeur: params . a + 5
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
})
