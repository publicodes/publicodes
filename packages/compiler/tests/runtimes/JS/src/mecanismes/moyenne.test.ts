import { describe, expect, test } from 'bun:test'
import { yaml } from '../compile'

describe('Mécanisme > moyenne', () => {
	test('simple', async () => {
		const { a } = await yaml`
a:
  moyenne:
    - 10
    - 4 kg
    - 5
    - 1
`
		expect(a.evaluate().value).toBe(5)
		expect(a.unit).toBe('kg')
	})

	test('valeur non applicable', async () => {
		const { a } = await yaml`
a:
  moyenne:
    - 10
    - b
    - 4 kg
    - 5
    - c
    - 1
b:
  valeur: 3
  non applicable si: oui
c:
  valeur: 5
  non applicable si: oui
`
		expect(a.evaluate().value).toBe(5)
		expect(a.unit).toBe('kg')
	})
})
