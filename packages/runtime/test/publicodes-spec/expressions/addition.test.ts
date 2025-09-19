import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Expressions > addition', () => {
	it('addition de nombre', async () => {
		const engine = await yaml`

addition: 28 + 1.1
`
		expect(engine.evaluate('addition').value).toEqual(29.1)
		expect(engine.outputs['addition'].type).toHaveProperty('number')
	})

	it('addition non applicable', async () => {
		const engine = await yaml`

règle non applicable:
  public: oui
  applicable si: non
addition: 5 + règle non applicable
`
		expect(engine.evaluate('addition').value).toEqual(5)
	})

	it('addition avec unité', async () => {
		const engine = await yaml`
salaire de base:
  unité: €
primes:
  unité: €
addition: salaire de base + primes
`
		expect(
			engine.evaluate('addition', {
				'salaire de base': 2000,
				primes: 500,
			}).value,
		).toEqual(2500)
		expect(engine.outputs['addition'].type).toMatchObject({
			number: true,
			unit: '€',
		})
	})
})
