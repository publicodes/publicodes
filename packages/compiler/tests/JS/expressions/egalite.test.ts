import { beforeAll, describe, expect, test } from 'bun:test'
import { TestPublicodes, yaml } from '../compile'

describe('Expressions > égalité', () => {
	let result: TestPublicodes[string]
	beforeAll(async () => {
		result = (
			await yaml`
result: a = 10
a:
`
		).result
	})

	test.each([
		['égalité', { a: 10 }, true],
		['différence', { a: 20 }, false],
	] as const)('%s', (_, context, expected) => {
		expect(result.evaluate(context)).toBe(expected)
	})

	test('non définie', () => {
		expect(result.evaluate({})).toBeUndefined()
	})

	// @TODO : doit-on garder ce comportement de la V1 ?
	test.skip('non applicable égal faux', async () => {
		const { result } = await yaml`
result: a = non
a:
  valeur: oui
  non applicable si: oui
`
		expect(result.evaluate()).toBe(true)
	})

	test("non applicable n'est pas égale à x, si x est applicable", async () => {
		const { result } = await yaml`
result: 12 = a

a:
  non applicable si: oui
`
		expect(result.evaluate()).toBe(false)
	})
})
