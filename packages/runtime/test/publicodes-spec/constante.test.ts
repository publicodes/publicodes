import { beforeAll, describe, expect, test } from 'bun:test'
import { TestPublicodes, yaml } from '../utils/compile'

describe('Constantes', () => {
	let r: TestPublicodes
	beforeAll(async () => {
		r = await yaml`

entier: 5
décimal: 5.4
date: 03/12/2025
booléen: oui
chaine: "Salut le monde"

`
	})

	test('entier', () => {
		expect(r.entier.evaluate()).toBe(5)
		expect(r.entier.type).toBe('number')
	})

	test('nombre décimal', () => {
		expect(r.décimal.evaluate()).toBe(5.4)
		expect(r.décimal.type).toBe('number')
	})

	test('date', () => {
		expect(r.date.evaluate()).toEqual(new Date('2025-12-03'))
		expect(r.date.type).toBe('date')
	})

	test('booléen', () => {
		expect(r.booléen.evaluate()).toBe(true)
		expect(r.booléen.type).toBe('boolean')
	})

	test('chaine', () => {
		expect(r.chaine.evaluate()).toBe('Salut le monde')
		expect(r.chaine.type).toBe('text')
	})
})
