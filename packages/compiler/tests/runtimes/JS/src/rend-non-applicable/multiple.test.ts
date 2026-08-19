import { describe, it, expect, beforeAll } from 'bun:test'
import { p, TestPublicodes, yaml } from '../compile'

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
		expect(p.isNotApplicable(x.evaluate({ a: true, b: true }).value)).toBeTrue()
	})

	it('un seul applicable', () => {
		expect(p.isNotApplicable(x.evaluate({ a: true }).value)).toBeTrue()
		expect(p.isNotApplicable(x.evaluate({ b: true }).value)).toBeTrue()
	})

	it('aucun applicable', () => {
		expect(p.isNotDefined(x.evaluate({ a: false, b: false }).value)).toBeTrue()
	})
})
