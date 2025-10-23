import { describe, expect, it, test } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Mécanisme > contexte', () => {
	test('simple', async () => {
		const engine = await yaml`
salaire brut: 2000€
salaire net: 50% * salaire brut
SMIC brut: 1000€

SMIC net:
  valeur: salaire net
  contexte:
    salaire brut: SMIC brut
`

		expect(engine['SMIC net'].evaluateParams()).toMatchObject({
			value: 500,
			missing: [],
		})
	})

	// @FIXME
	test.skip('avec règle imbriqué (cycle)', async () => {
		const engine = await yaml`
cotisation:
  valeur: 10% * salaire brut
  plafond: plafond
  avec:
    plafond:
      valeur: cotisation
      contexte:
        salaire brut: 1000 €
        plafond: non
salaire brut: 10000 €
`

		expect(engine['cotisation'].evaluateParams()).toMatchObject({
			value: 100,
			missing: [],
		})
	})

	test('les variables remplacé dans un contexte sont évaluées en dehors de ce dernier', async () => {
		const engine = await yaml`
test:
  valeur: a
  avec:
    a: b
    b: 5
  contexte:
    b: b + 10
`

		expect(engine['test'].evaluateParams()).toMatchObject({
			value: 15,
			missing: [],
		})
	})

	test('les variables remplacé dans un contexte sont évaluées en dehors de ce dernier (composé)', async () => {
		const engine = await yaml`
test:
  valeur: a + b
  avec:
    a: 5
    b: 10
  contexte:
    a: a + b
    b: 0
`
		expect(engine['test'].evaluateParams()).toMatchObject({
			value: 15,
			missing: [],
		})
	})

	test('contexte imbriqué', async () => {
		// Lors de plusieurs contextes imbriqués, le contexte le plus profond a la priorité.
		const engine = await yaml`
x:
  # valeur attendue: 3
  valeur: y
  contexte:
    a: 1
    b: 1

y:
  # valeur attendue: 2
  valeur: z
  contexte:
    a: 2

z: a + b
a: 0
b: 0
`
		expect(engine['x'].evaluateParams()).toMatchObject({
			value: 3,
			missing: [],
		})

		expect(engine['y'].evaluateParams()).toMatchObject({
			value: 2,
			missing: [],
		})
	})

	test('deux contextes différents sur la même variable', async () => {
		// Lors de plusieurs contextes imbriqués, le contexte le plus profond a la priorité.
		const engine = await yaml`
x:
  valeur: a
  contexte:
    a: 1

y:
  valeur: a
  contexte:
    a: 2

z: a

a:
  par défaut: 3
test: x + y + z
`
		expect(engine['x'].evaluateParams()).toMatchObject({
			value: 1,
			missing: [],
		})

		expect(engine['y'].evaluateParams()).toMatchObject({
			value: 2,
			missing: [],
		})

		expect(engine['test'].evaluateParams()).toMatchObject({
			value: 6,
			missing: ['a'],
		})

		expect(
			engine['test'].evaluateParams({
				a: 4,
			}),
		).toMatchObject({
			value: 7,
			missing: [],
		})
	})

	// @TODO
	it.skip('contexte et inversion fonctionnent ensemble', async () => {
		const engine = await yaml`
test:
  valeur: b
  avec:
    a: 4 * b
    b:
      inversion numérique:
        - a
      contexte:
        a: 8
`
		expect(engine['test'].evaluateParams()).toMatchObject({
			value: 2,
			missing: [],
		})
	})
})
