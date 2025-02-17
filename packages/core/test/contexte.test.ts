import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { parse } from 'yaml'
import Engine from '../src'

describe('When two different contexte are nested', () => {
	const rulesYaml = parse(`
a: 1
b: a * 2
c:
  valeur: b
  contexte:
      a: 10
d:
  valeur: c
  contexte:
    a: 100
`)

	beforeEach(() => {
		vi.spyOn(console, 'warn')
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('evaluation of rule on top of the chain', () => {
		it('evaluates to something', () => {
			expect(new Engine(rulesYaml).evaluate('d').nodeValue).toBe(20)
		})

		it('does not throw any warning', () => {
			new Engine(rulesYaml).evaluate('d')
			expect(console.warn).not.toHaveBeenCalled()
		})
	})

	describe('evaluation of middle rule', () => {
		it('evaluates to something', () => {
			expect(new Engine(rulesYaml).evaluate('c').nodeValue).toBeDefined()
		})

		it('does not throw any warning', () => {
			new Engine(rulesYaml).evaluate('c')
			expect(console.warn).not.toHaveBeenCalled()
		})
	})
})

describe('When rule contains itself in the context', () => {
	const rules = {
		a: 100,
		b: {
			produit: ['a', '50%'],
			plafond: {
				valeur: 'b',
				contexte: {
					a: 50,
				},
			},
		},
	}

	beforeEach(() => {
		vi.spyOn(console, 'warn')
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('evaluation of rule', () => {
		it('evaluates properly', () => {
			expect(new Engine(rules).evaluate('b').nodeValue).toBe(25)
		})

		it('does not throw any warning', () => {
			new Engine(rules).evaluate('b')
			expect(console.warn).not.toHaveBeenCalled()
		})
	})
})
