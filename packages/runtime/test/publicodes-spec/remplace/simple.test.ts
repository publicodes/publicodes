import { describe, test, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

const engine = await yaml`
restaurant:
  avec:
    prix du repas: 10 €/repas
    client gourmand:
    menu gourmand:
      applicable si: client gourmand
      remplace: prix du repas
      valeur: 15 €/repas

test: restaurant . prix du repas
`

describe('Remplace > simple', () => {
	test('non applicable', () => {
		expect(
			engine.evaluate('test', { 'restaurant . client gourmand': false }).value,
		).toBe(10)
	})

	test('applicable', () => {
		expect(
			engine.evaluate('test', { 'restaurant . client gourmand': true }).value,
		).toBe(15)
	})

	test('condition non définie', () => {
		expect(engine.evaluate('test').value).toBe(10)
	})

	test('remplace non défini', async () => {
		const engine = await yaml`
a:
  remplace: b
b: 1
x: b
`
		expect(engine.evaluate('x').value).toBe(undefined)
	})
})
