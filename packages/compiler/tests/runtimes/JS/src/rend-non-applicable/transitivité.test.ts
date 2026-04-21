import { describe, it, expect } from 'bun:test'
import { p, yaml, value } from '../compile'

describe('Rend non applicable > transitivité', () => {
	it('simple', async () => {
		const { x } = await yaml`
    a:
      valeur: oui
      rend non applicable: b
    b:
      valeur: oui
      rend non applicable: c # doesn't apply because b is not applicable because of a

    c: oui
    x: c
  `
		expect(value(x.evaluate())).toBe(true)
	})

	it('simple', async () => {
		const { x } = await yaml`
    a:
      valeur: oui
      rend non applicable: b
    b:
      valeur: oui
      rend non applicable: c
    c:
      valeur: oui
      rend non applicable: d  # apply because b is not applicable because of a

    d: oui
    x: d
  `
		expect(p.isNotApplicable(value(x.evaluate()))).toBeTrue()
	})
})
