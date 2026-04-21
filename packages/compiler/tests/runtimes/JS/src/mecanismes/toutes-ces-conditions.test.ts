import { describe, test, expect } from 'bun:test'
import { yaml, value } from '../compile'

describe('Mécanisme > toutes ces conditions', () => {
	test('avec une expression', async () => {
		const { test } = await yaml`
test:
  valeur:
    toutes ces conditions:
      - 10 > 5
`
		expect(value(test.evaluate())).toBe(true)
	})

	test('avec deux expressions', async () => {
		const { test } = await yaml`
test:
  valeur:
    toutes ces conditions:
      - 10 > 5
      - 5 = 2
`
		expect(value(test.evaluate())).toBe(false)
	})

	test('avec une référence à une règle non applicable', async () => {
		const { test, test2 } = await yaml`

ref:
  applicable si: non

test:
  valeur:
    toutes ces conditions:
      - ref

test2:
  valeur:
    toutes ces conditions:
      - ref
      - 10 > 5
`
		expect(value(test.evaluate())).toBe(false)
		expect(value(test2.evaluate())).toEqual(false)
	})
})
