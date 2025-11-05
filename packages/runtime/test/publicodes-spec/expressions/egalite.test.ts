import { beforeAll, describe, expect, test } from 'bun:test'
import { TestPublicodes, yaml } from '../../utils/compile'

describe('Expressions > égalité', () => {
	let result: TestPublicodes[string]
	beforeAll(async () => {
		result = (
			await yaml`
result: 10 = a
a:
`
		).result
	})

	test.each([
		['égalité', { a: 10 }, true],
		['différence', { a: 20 }, false],
		['non définie', {}, undefined],
	])('%s', (_, context, expected) => {
		expect(result.evaluate(context)).toBe(expected)
	})

	test('non applicable égal faux', async () => {
		const { result } = await yaml`
result: a = non
a:
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

	test("l'égalité de deux valeurs non applicable est non applicable", async () => {
		const { result } = await yaml`
result: a = b

a:
  non applicable si: oui
b:
  non applicable si: oui
`
		expect(result.evaluate()).toBe(null)
	})
})
