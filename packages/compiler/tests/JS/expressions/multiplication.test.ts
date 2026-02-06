import { describe, expect, test } from 'bun:test'
import { yaml } from '../compile'

describe('Expressions > multiplication', () => {
	test('simple', async () => {
		const { produit } = await yaml`

salaire de base:
  unité: $

produit:
  valeur: salaire de base * 3
`
		expect(produit.evaluate({ 'salaire de base': 1000 })).toEqual(3000)
		expect(produit.unit).toBe('$')
	})

	test('valeur non applicable', async () => {
		const { produit } = await yaml`
a:
  non applicable si: oui
  unité: €
produit: a * 3
`
		expect(produit.evaluate()).toEqual(null)
		expect(produit.unit).toBe('€')
	})

	test('valeur non définie', async () => {
		const { produit } = await yaml`
a:
  unité: €
produit: a * 3
`
		expect(produit.evaluateParams().missing).toEqual(['a'])
		expect(produit.unit).toBe('€')
	})

	// @FIXME this could be difficult...
	test.skip('lazy si null ou 0', async () => {
		const { produit } = await yaml`
a:
b:
produit: a * b
`
		;([{ a: 0 }, { b: 0 }] as const).forEach((s) => {
			expect(produit.evaluate(s)).toBe(0)
			expect(produit.evaluateParams(s).missing).toEqual([])
		})
		;([{ a: null }, { b: null }] as const).forEach((s) => {
			expect(produit.evaluate(s)).toBe(null)
			expect(produit.evaluateParams(s).missing).toEqual([])
		})
	})
})
