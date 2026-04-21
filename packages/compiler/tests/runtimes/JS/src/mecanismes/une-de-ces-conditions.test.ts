import { describe, test, expect } from 'bun:test'
import { yaml, value } from '../compile'

describe('Mécanisme > une de ces conditions', () => {
	test('avec une expression', async () => {
		const { test } = await yaml`
test:
  valeur:
    une de ces conditions:
      - 10 > 5
`
		expect(value(test.evaluate())).toBe(true)
	})

	test('avec deux expressions', async () => {
		const { test } = await yaml`
test:
  valeur:
    une de ces conditions:
      - 10 < 5
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
    une de ces conditions:
      - ref

test2:
  valeur:
    une de ces conditions:
      - ref
      - 10 < 5
`
		expect(value(test.evaluate())).toBe(false)
		expect(value(test2.evaluate())).toBe(false)
	})
})
