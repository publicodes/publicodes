import { describe, it, expect } from 'bun:test'
import { yaml } from '../compile'

describe('Mécanisme > est non défini', () => {
	it('règle définie', async () => {
		const { a } = await yaml`
a:
  est non défini: b

b: oui
`
		expect(a.evaluate().value).toBe(false)
	})

	it('règle non définie', async () => {
		const { a } = await yaml`
a:
  est non défini: b

b:
`
		expect(a.evaluate().value).toBe(true)
	})
})
