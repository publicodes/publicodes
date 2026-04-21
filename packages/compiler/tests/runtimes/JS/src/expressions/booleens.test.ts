import { describe, it, expect, beforeAll } from 'bun:test'
import { TestPublicodes, yaml, value } from '../compile'

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
		expect(value(rules.a.evaluate())).toEqual(true)
		expect(rules.a.type).toBe('boolean')
	})

	it('paramètre', () => {
		expect(value(rules.paramètre.evaluate({ paramètre: true }))).toBe(true)
		expect(value(rules.paramètre.evaluate({ paramètre: false }))).toBe(false)
	})

	it('négation', () => {
		expect(value(rules.négation.evaluate())).toBe(false)
		expect(rules.négation.type).toBe('boolean')
	})
})
