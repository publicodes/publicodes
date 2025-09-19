import { describe, it, expect } from 'bun:test'
import { TestPublicodes, yaml } from '../../utils/compile'

describe('Rend non applicable > multiple', () => {
	let engine: TestPublicodes
	beforeAll(async () => {
		engine = await yaml`
	  a:
    rend non applicable: c

  b:
    rend non applicable: c
  c:
  x: c
`
	})
	it('tous applicable', () => {
		expect(
			engine.evaluate('x', {
				a: true,
				b: true,
			}).value,
		).toBe(null)
	})

	it('un seul applicable', () => {
		expect(engine.evaluate('x', { a: true }).value).toBe(null)
		expect(engine.evaluate('x', { b: true }).value).toBe(null)
	})

	it('aucun applicable', () => {
		expect(engine.evaluate('x', { a: false, b: false }).value).toBe(undefined)
	})
})
