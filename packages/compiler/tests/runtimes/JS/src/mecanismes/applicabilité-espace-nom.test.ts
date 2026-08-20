import { describe, it, expect } from 'bun:test'
import { p, yaml } from '../compile'

describe("Mécanisme > applicabilité étendue à l'espace de nom", () => {
	it('simple', async () => {
		const engine = await yaml`
a:
  applicabilité étendue à l'espace de nom: oui
  avec:
    b: 42
`

		expect(engine['a . b'].evaluate().value).toBe(42)
	})

	it("applicabilité étendue à l'espace de nom", async () => {
		const engine = await yaml`
test:
  applicable si:
    est défini: condition
  applicabilité étendue à l'espace de nom: oui
  avec:
    valeur: 10
condition:
  type: booléen
`

		expect(p.isNotApplicable(engine['test . valeur'].evaluate().value))
		expect(
			p.isNotApplicable(
				engine['test . valeur'].evaluate({ condition: true }).value,
			),
		).toBe(false)
	})
})
