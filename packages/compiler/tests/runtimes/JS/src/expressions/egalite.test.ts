import { beforeAll, describe, expect, test } from 'bun:test'
import { p, TestPublicodes, yaml } from '../compile'

describe('Expressions > égalité', () => {
	let model: TestPublicodes
	beforeAll(async () => {
		model = await yaml`
result: a = 10
a:
`
	})

	test.each([
		['égalité', { a: 10 }, true],
		['différence', { a: 20 }, false],
	] as const)('%s', (_, context, expected) => {
		expect(model.result.evaluate(context).value).toBe(expected)
	})

	test('non définie', () => {
		const val = model.result.evaluate({}).value
		expect(p.isNotDefined(val)).toBeTrue()
	})

	// @TODO : doit-on garder ce comportement de la V1 ?
	test.skip('non applicable égal faux', async () => {
		const { result } = await yaml`
result: a = non
a:
  valeur: oui
  non applicable si: oui
`
		expect(result.evaluate().value).toBe(true)
	})

	test("non applicable n'est pas égale à x, si x est applicable", async () => {
		const { result } = await yaml`
result: 12 = a

a:
  non applicable si: oui
`
		expect(result.evaluate({}).value).toBe(false)
	})
})
