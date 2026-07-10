import { describe, it, expect } from 'bun:test'
import { p, yaml } from '../compile'

describe('Mécanisme > est défini', () => {
	it('règle définie', async () => {
		const { a } = await yaml`
a:
  est défini: b

b: oui
`
		expect(a.evaluate().value).toBe(true)
	})

	it('règle non définie', async () => {
		const { a } = await yaml`
a:
  est défini: b

b:
`
		expect(a.evaluate().value).toBe(false)
	})

	it("dans une condition d'applicabilité", async () => {
		const { a } = await yaml`
a:
  applicable si:
    est défini: b
  valeur: 10

b: oui
`
		expect(a.evaluate().value).toBe(10)
	})

	it("dans une condition d'applicabilité avec une règle non définie", async () => {
		const { a, b } = await yaml`
a:
  applicable si:
    est défini: b
  valeur: 10

b:
`
		expect(p.isNotApplicable(a.evaluate().value)).toBeTrue()
		expect(p.isNotDefined(b.evaluate().value)).toBeTrue()
	})
})
