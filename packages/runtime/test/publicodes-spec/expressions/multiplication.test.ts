import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Expressions > multiplication', () => {
	it('produit', async () => {
		const engine = await yaml`

salaire de base:
  unité: $

produit:
  valeur: salaire de base * 3
`
		expect(
			engine.evaluate('produit', { 'salaire de base': 1000 }).value,
		).toEqual(3000)
		expect(engine.outputs['produit'].type.unit).toBe('$')
	})
})
