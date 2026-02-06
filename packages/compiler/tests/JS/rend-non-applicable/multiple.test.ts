import { describe, it, expect, beforeAll } from 'bun:test'
import { TestPublicodes, yaml } from '../compile'

describe('Rend non applicable > multiple', () => {
	let x: TestPublicodes[string]
	beforeAll(async () => {
		x = (
			await yaml`
a:
  rend non applicable: c

b:
  rend non applicable: c
c:
x: c
`
		).x
	})
	it('tous applicable', () => {
		expect(x.evaluate({ a: true, b: true })).toBe(null)
	})

	it('un seul applicable', () => {
		expect(x.evaluate({ a: true })).toBe(null)
		expect(x.evaluate({ b: true })).toBe(null)
	})

	it('aucun applicable', () => {
		expect(x.evaluate({ a: false, b: false })).toBe(undefined)
	})
})
