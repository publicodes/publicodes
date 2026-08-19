import { describe, it, expect, beforeAll } from 'bun:test'
import { TestPublicodes, yaml } from '../compile'

describe('Expressions > booléens', () => {
	let rules: TestPublicodes

	beforeAll(async () => {
		rules = await yaml`
a: oui
négation: a = non
paramètre:
  type: booléen
`
	})

	it('constante', () => {
		expect(rules.a.evaluate().value).toEqual(true)
		expect(rules.a.type).toBe('boolean')
	})

	it('paramètre', () => {
		expect(rules.paramètre.evaluate({ paramètre: true }).value).toBe(true)
		expect(rules.paramètre.evaluate({ paramètre: false }).value).toBe(false)
	})

	it('négation', () => {
		expect(rules.négation.evaluate().value).toBe(false)
		expect(rules.négation.type).toBe('boolean')
	})
})
