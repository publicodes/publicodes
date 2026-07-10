import { describe, it, expect } from 'bun:test'
import { p, yaml } from '../compile'

describe('Mécanisme > est non applicable', () => {
	it('simple', async () => {
		const { a } = await yaml`
a:
  est non applicable: b

b: 10
`
		expect(a.evaluate().value).toBe(false)
	})
})
