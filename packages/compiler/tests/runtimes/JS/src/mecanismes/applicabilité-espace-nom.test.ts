import { describe, it, expect } from 'bun:test'
import { p, yaml } from '../compile'

describe("Mécanisme > applicabilité étendue à l'espace de nom", () => {
	it('simple', async () => {
		const engine = await yaml`
a:
  applicabilité étendue à l'espace de nom: oui
  valeur: oui
  avec:
    b: 42
`
		const subject = engine['a . b'].evaluate()
		expect(subject.value).toBe(42)
		expect(subject.missing.length).toBe(0)
	})

	it('parent non-définie', async () => {
		const engine = await yaml`
a:
  applicabilité étendue à l'espace de nom: oui
  avec:
    b: 42
`

		const subject = engine['a . b'].evaluate()
		expect(p.isNotApplicable(subject.value)).toBe(true)
		expect(subject.missing.length).toBe(1)
		expect(subject.missing).toEqual(['a'])
	})

	it('dépendances de parents', async () => {
		const engine = await yaml`
a:
  applicabilité étendue à l'espace de nom: oui
  applicable si: c
  valeur: oui
  avec:
    b: 42
c:
`

		const subject = engine['a . b'].evaluate()
		expect(p.isNotApplicable(subject.value)).toBe(true)
		expect(subject.missing.length).toBe(1)
		expect(subject.missing).toEqual(['c'])

		const subject2 = engine['a . b'].evaluate({ c: true })
		expect(p.isNotApplicable(subject2.value)).toBe(false)
		expect(subject2.value).toBe(42)
	})

	it('dépendances de parents non définie', async () => {
		const engine = await yaml`
a:
  applicabilité étendue à l'espace de nom: oui
  applicable si: c
  avec:
    b: 42
c:
`

		const subject = engine['a . b'].evaluate()
		expect(p.isNotApplicable(subject.value)).toBe(true)
		expect(subject.missing.length).toBe(1)
		expect(subject.missing).toEqual(['c'])

		const subject2 = engine['a . b'].evaluate({ c: true })
		expect(p.isNotApplicable(subject2.value)).toBe(true)
		expect(subject2.missing.length).toBe(1)
		expect(subject2.missing).toEqual(['a'])
	})
})
