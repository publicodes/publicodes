import { beforeAll, describe, expect, test } from 'bun:test'
import { TestPublicodes, yaml } from '../compile'

describe('Expressions > différence', () => {
	let result: TestPublicodes[string]
	beforeAll(async () => {
		result = (
			await yaml`
result: a != 10
a:
`
		).result
	})

	test.each([
		['égalité', { a: 10 }, false],
		['différence', { a: 20 }, true],
		['non définie', {}, undefined],
	])('%s', (_, context, expected, done) => {
		expect(result.evaluate(context)).toBe(expected)
		done()
	})
	// @TODO : doit-on garder ce comportement de la V1 ?
	test.skip('non applicable égal faux', async () => {
		const { result } = await yaml`
result: a != non
a:
  non applicable si: oui
`
		expect(result.evaluate()).toBe(false)
	})

	test("non applicable n'est pas égale à x, si x est applicable", async () => {
		const { result } = await yaml`
result: 12 != a

a:
  non applicable si: oui
`
		expect(result.evaluate()).toBe(true)
	})
})
