import { describe, it, expect, beforeAll } from 'bun:test'
import { TestPublicodes, yaml } from '../../utils/compile'

describe('Expressions > booléens', () => {
	let engine: TestPublicodes

	beforeAll(async () => {
		engine = await yaml`
a: oui
négation: a != oui
paramètre:
  type: booléen
`
	})

	it('constante', () => {
		expect(engine.evaluate('a').value).toEqual(true)
		expect(engine.getType('a')).toHaveProperty('boolean')
	})

	it('paramètre', () => {
		expect(engine.evaluate('paramètre', { paramètre: true }).value).toEqual(
			true,
		)
		expect(engine.evaluate('paramètre', { paramètre: false }).value).toEqual(
			false,
		)
	})

	it('négation', () => {
		expect(engine.evaluate('négation').value).toEqual(false)
		expect(engine.getType('négation')).toHaveProperty('boolean')
	})
})
