import { describe, expect, test } from 'bun:test'
import { p, yaml } from '../compile'

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
		expect(c.evaluate({ a: 20, b: 12 }).value).toBeCloseTo(10)
		expect(a.evaluate({ b: 12 }).value).toBeCloseTo(27)
		expect(b.evaluate({ a: 20 }).value).toBeCloseTo(5)

		expect(p.isNotDefined(c.evaluate().value)).toBe(true)
		expect(c.evaluate().missing).toEqual(['a', 'b'])
	})

	test('complex dependency tracking', async () => {
		const { b, d } = await yaml`
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
		expect(b.evaluate({ a: 30 }).value).toBeCloseTo(30)

		expect(d.params).toEqual(['a', 'c'])
		expect(d.evaluate().missing).toEqual(['a'])
		expect(p.isNotDefined(d.evaluate({ a: 10 }).value)).toBe(true)
		expect(d.evaluate({ a: 10 }).missing).toEqual(['c'])
		expect(d.evaluate({ a: 30, c: 10 }).value).toBeCloseTo(10)
	})

	test('continues to work', async () => {
		const { a, c } = await yaml`
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
		expect(a.evaluate().value).toEqual(25)
		expect(c.evaluate({ b: 20 }).value).toBeCloseTo(10)
	})
})
