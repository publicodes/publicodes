import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Expressions > division', () => {
	it('division', async () => {
		const engine = await yaml`

salaire de base:
  unité: ¥

produit:
  valeur: salaire de base / 3
`
		expect(
			engine.evaluate('produit', { 'salaire de base': 3000 }).value,
		).toEqual(1000)
		expect(engine.outputs['produit'].type.unit).toBe('¥')
	})

	it('division inverse', async () => {
		const engine = await yaml`

salaire de base:
  unité: ¥

produit:
  valeur: 3 / salaire de base
`
		expect(
			engine.evaluate('produit', { 'salaire de base': 3000 }).value,
		).toEqual(0.001)
		expect(engine.outputs['produit'].type.unit).toBe('/¥')
	})
})
