import { describe, expect, test } from 'bun:test'
import { p, yaml } from '../compile'

// Et ça me fait penser, dans les tests à ajouter, je mettrai bien aussi en JS des tests pour min max et tolérance (que se passe-t'il si valeur à inverser en dehors des bornes, etc)

describe('Mécanisme > inversion numérique', () => {
	test('simple', async () => {
		const engine = await yaml`
a: c + 10
b: c - 5
c:
  inversion numérique:
    avec:
      - a
      - b
    min: 0
    max: 100000
`
		expect(engine['c'].evaluate({ a: 20 }).value).toBeCloseTo(10)
		expect(engine['c'].evaluate({ b: 12 }).value).toBeCloseTo(17)
		expect(engine['c'].evaluate({ a: 20, b: 12 }).value).toBeCloseTo(10)
		expect(engine['a'].evaluate({ b: 12 }).value).toBeCloseTo(27)
		expect(engine['b'].evaluate({ a: 20 }).value).toBeCloseTo(5)

		expect(p.isNotDefined(engine['c'].evaluate().value)).toBe(true)
		expect(engine['c'].evaluate().missing).toEqual(['a', 'b'])
	})

	test('complex dependency tracking', async () => {
		const engine = await yaml`
a: c + d + 10
b:
  valeur: c + d + 10
  contexte:
    c: 10
c:
d:
  inversion numérique:
    avec:
      - a
    min: 0
    max: 100000
`
		expect(engine['b'].evaluate({ a: 30 }).value).toBeCloseTo(30)

		expect(engine['d'].evaluate().missing).toEqual(['a'])
		expect(p.isNotDefined(engine['d'].evaluate({ a: 10 }).value)).toBe(true)
		expect(engine['d'].evaluate({ a: 10 }).missing).toEqual(['c'])
		expect(engine['d'].evaluate({ a: 30, c: 10 }).value).toBeCloseTo(10)
	})

	test('continues to work', async () => {
		const engine = await yaml`
a:
  valeur: c + 10
  contexte:
   c: 15
b:
  valeur: c + 10
c:
  inversion numérique:
    avec:
      - b
    min: 0
    max: 100000
`
		expect(engine['a'].evaluate().value).toEqual(25)
		expect(engine['c'].evaluate({ b: 20 }).value).toBeCloseTo(10)
	})

	test('hors des bornes', async () => {
		const engine = await yaml`
a: b + 10
b:
  inversion numérique:
    avec:
      - a
    min: 50
    max: 100
`
		expect(() => {
			engine['b'].evaluate({ a: 120 })
		}).toThrow()
		expect(() => {
			engine['b'].evaluate({ a: 50 })
		}).toThrow()
	})

	test('quand non applicable', async () => {
		const engine = await yaml`
a:
  valeur: c + 10
  applicable si: est applicable
  avec:
    est applicable: oui
b:
  valeur: c - 10
  applicable si: est applicable
  avec:
    est applicable: oui
c:
  inversion numérique:
    - a # 20 -> 30
    - b # 20 -> 10
`
		expect(
			engine['c'].evaluate({
				a: 20,
				b: 20,
				'a . est applicable': false,
			}).value,
		).toBeCloseTo(30)
		expect(
			engine['c'].evaluate({
				a: 20,
				b: 20,
				'b . est applicable': false,
			}).value,
		).toBeCloseTo(10)
		expect(
			p.isNotDefined(
				engine['c'].evaluate({
					a: 20,
					b: 20,
					'a . est applicable': false,
					'b . est applicable': false,
				}).value,
			),
		).toBeTrue()
	})

	test.skip('quand parfois non applicable', async () => {
		const engine = await yaml`
a:
  valeur: b + 10
  applicable si: b >= 10 and b <= 100
b:
  inversion numérique: a
`
		expect(engine['b'].evaluate({ a: 70 }).value).toBeCloseTo(60)
	})

	test('quand ne converge pas', async () => {
		const engine = await yaml`
a:
  valeur: b - b + 10 # = 10
b:
  inversion numérique: a
`
		expect(() => {
			engine['b'].evaluate({ a: 120 })
		}).toThrow()
	})

	test('avec arrondi', async () => {
		const engine = await yaml`
a: b + 10
b:
  inversion numérique: a
  arrondi: 0.1
`
		expect(engine['b'].evaluate({ a: 12.555 }).value).toBeCloseTo(2.6)
	})
})
