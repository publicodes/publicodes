import { describe, expect, test } from 'bun:test'
import { yaml } from '../compile'

describe('Mécanisme > inversion numérique', () => {
	test('simple', async () => {
		const { a, b, c } = await yaml`
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
		expect(c.evaluate({ a: 20 }).value).toBeCloseTo(10)
		expect(c.evaluate({ b: 12 }).value).toBeCloseTo(17)
		expect(a.evaluate({ b: 12 }).value).toBeCloseTo(27)
		expect(b.evaluate({ a: 20 }).value).toBeCloseTo(5)
	})

	test('no available candidate', async () => {
		const { a, b, c } = await yaml`
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
		expect(() => c.evaluate().value).toThrowError(
			'No available candidate with value for root-finding, expecting either a, b',
		)
	})

	test('complex dependency tracking', async () => {
		const { a, b, c, d } = await yaml`
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
		expect(d.evaluate({ a: 30, c: 10 }).value).toBeCloseTo(10)
		expect(() => d.evaluate({ a: 30 }).value).toThrowError(
			'No available candidate with value for root-finding, expecting either a',
		)
		expect(b.evaluate({ a: 30 }).value).toBeCloseTo(30)
	})
})
