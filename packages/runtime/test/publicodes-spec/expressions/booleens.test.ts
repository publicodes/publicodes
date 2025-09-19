import { describe, it, expect, beforeAll } from 'bun:test'
import { TestPublicodes, yaml } from '../../utils/compile'

describe('Expressions > booléens', async () => {
	let engine: TestPublicodes
	beforeAll(async () => {
		engine = await yaml`
a: oui
négation: a != oui
paramètre:
  type: booléen
`
	})

	it('constante', async () => {
		expect(engine.evaluate('a').value).toEqual(true)
		expect(engine.outputs['a'].type).toHaveProperty('boolean')
	})

	it('paramètre', async () => {
		expect(engine.evaluate('paramètre', { paramètre: true }).value).toEqual(
			true,
		)
		expect(engine.evaluate('paramètre', { paramètre: false }).value).toEqual(
			false,
		)
	})

	it('négation', async () => {
		expect(engine.evaluate('négation').value).toEqual(false)
		expect(engine.outputs['négation'].type).toHaveProperty('boolean')
	})
})
