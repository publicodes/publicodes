import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Expressions > division', () => {
	it('division', async () => {
		const { division } = await yaml`

salaire de base:
  unité: ¥

division:
  valeur: salaire de base / 3
`
		expect(division.evaluate({ 'salaire de base': 3000 })).toEqual(1000)
		expect(division.unit).toBe('¥')
	})

	it('division inverse', async () => {
		const { division } = await yaml`

salaire de base:
  unité: ¥

division:
  valeur: 3 / salaire de base
`
		expect(division.evaluate({ 'salaire de base': 3000 })).toEqual(0.001)
		expect(division.unit).toBe('/¥')
	})
})
