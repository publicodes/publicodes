import { describe, it, expect } from 'bun:test'
import { yaml } from '../utils/compile'

describe('Constantes', async () => {
	const engine = await yaml`

entier: 5
décimal: 5.4
date: 03/12/2025
booléen: oui
chaine: "Salut le monde"

`

	it('entier', async () => {
		expect(engine.evaluate('entier').value).toEqual(5)
		expect(engine.outputs['entier'].type).toHaveProperty('number')
	})

	it('nombre décimal', async () => {
		expect(engine.evaluate('décimal').value).toEqual(5.4)
	})

	it('date', async () => {
		expect(engine.evaluate('date').value).toEqual(new Date('2025-12-03'))
	})

	it('booléen', async () => {
		expect(engine.evaluate('booléen').value).toEqual(true)
	})

	it('chaine', async () => {
		expect(engine.evaluate('chaine').value).toEqual('Salut le monde')
	})
})
