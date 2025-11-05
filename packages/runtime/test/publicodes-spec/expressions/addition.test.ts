import { describe, expect, test } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Expressions > addition', () => {
	test('addition de nombre', async () => {
		const { addition } = await yaml`
addition: 28 + 1.1
`
		expect(addition.evaluate()).toBe(29.1)
		expect(addition.type).toBe('number')
	})

	test("addition d'un nombre non applicable", async () => {
		const { addition } = await yaml`

règle non applicable:
  public: oui
  applicable si: non
addition: 5 + règle non applicable
`
		expect(addition.evaluate()).toEqual(5)
	})

	test('addition de deux nombres non applicable est 0', async () => {
		const { addition } = await yaml`

règle non applicable:
  public: oui
  applicable si: non
addition: règle non applicable + règle non applicable
`
		expect(addition.evaluate()).toEqual(0)
	})

	test('addition avec unité', async () => {
		const { addition } = await yaml`
salaire de base:
  unité: €
primes:
  unité: €
addition: salaire de base + primes
`
		expect(
			addition.evaluate({
				'salaire de base': 2000,
				primes: 500,
			}),
		).toEqual(2500)
		expect(addition.type).toBe('number')
	})
})
