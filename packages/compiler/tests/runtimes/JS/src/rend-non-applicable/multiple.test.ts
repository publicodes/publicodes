import { describe, it, expect, beforeAll } from 'bun:test'
import { p, TestPublicodes, yaml, value } from '../compile'

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
		expect(
			p.isNotApplicable(value(x.evaluate({ a: true, b: true }))),
		).toBeTrue()
	})

	it('un seul applicable', () => {
		expect(p.isNotApplicable(value(x.evaluate({ a: true })))).toBeTrue()
		expect(p.isNotApplicable(value(x.evaluate({ b: true })))).toBeTrue()
	})

	it('aucun applicable', () => {
		expect(p.isNotDefined(value(x.evaluate({ a: false, b: false })))).toBeTrue()
	})
})
