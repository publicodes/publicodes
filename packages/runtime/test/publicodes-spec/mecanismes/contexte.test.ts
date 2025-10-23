import { describe, it, expect, beforeAll } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Mécanisme > contexte', () => {
	beforeAll(async () => {})
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

		expect(engine.evaluate('SMIC net')).toMatchObject({
			value: 500,
			missingParameters: [],
		})
	})

	test('avec règle imbriqué (cycle)', async () => {
		const engine = await yaml`
cotisation:
  valeur: 10% * salaire brut
  plafond: plafond
  avec:
    plafond:
      valeur: impôt
      contexte:
        salaire brut: 1000 €
        plafond: non
salaire brut: 10000 €
`

		expect(engine.evaluate('cotisation')).toMatchObject({
			value: 100,
			missingParameters: [],
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

		expect(engine.evaluate('test')).toMatchObject({
			value: 15,
			missingParameters: [],
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
  exemples:
    - valeur attendue: 15
`
		expect(engine.evaluate('test')).toMatchObject({
			value: 15,
			missingParameters: [],
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
		expect(engine.evaluate('x')).toMatchObject({
			value: 3,
			missingParameters: [],
		})

		expect(engine.evaluate('y')).toMatchObject({
			value: 2,
			missingParameters: [],
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
		expect(engine.evaluate('x')).toMatchObject({
			value: 3,
			missingParameters: [],
		})

		expect(engine.evaluate('y')).toMatchObject({
			value: 2,
			missingParameters: [],
		})

		expect(engine.evaluate('test')).toMatchObject({
			value: 6,
			missingParameters: ['a'],
		})

		expect(
			engine.evaluate('test', {
				a: 4,
			}),
		).toMatchObject({
			value: 7,
			missingParameters: ['a'],
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
		expect(engine.evaluate('test')).toMatchObject({
			value: 2,
			missingParameters: [],
		})
	})
})
