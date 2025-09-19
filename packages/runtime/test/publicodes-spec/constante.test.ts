import { describe, it, expect } from 'bun:test'
import { TestPublicodes, yaml } from '../utils/compile'

describe('Constantes', () => {
	let engine: TestPublicodes
	beforeAll(async () => {
		engine = await yaml`

entier: 5
décimal: 5.4
date: 03/12/2025
booléen: oui
chaine: "Salut le monde"

`
	})

	it('entier', () => {
		expect(engine.evaluate('entier').value).toEqual(5)
		expect(engine.outputs['entier'].type).toHaveProperty('number')
	})

	it('nombre décimal', () => {
		expect(engine.evaluate('décimal').value).toEqual(5.4)
	})

	it('date', () => {
		expect(engine.evaluate('date').value).toEqual(new Date('2025-12-03'))
	})

	it('booléen', () => {
		expect(engine.evaluate('booléen').value).toEqual(true)
	})

	it('chaine', () => {
		expect(engine.evaluate('chaine').value).toEqual('Salut le monde')
	})
})
