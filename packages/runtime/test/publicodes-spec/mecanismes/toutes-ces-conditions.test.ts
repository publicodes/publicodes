import { describe, test, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Mécanisme > toutes ces conditions', () => {
	test('avec une expression', async () => {
		const engine = await yaml`
test:
  valeur:
    toutes ces conditions:
      - 10 > 5
`
		expect(engine.evaluate('test').value).toEqual(true)
	})

	test('avec deux expressions', async () => {
		const engine = await yaml`
test:
  valeur:
    toutes ces conditions:
      - 10 > 5
      - 5 = 2
`
		expect(engine.evaluate('test').value).toEqual(false)
	})

	test('avec une référence à une règle non applicable', async () => {
		const engine = await yaml`

ref:
  applicable si: non

test:
  valeur:
    toutes ces conditions:
      - ref

test 2:
  valeur:
    toutes ces conditions:
      - ref
      - 10 > 5
`
		expect(engine.evaluate('test').value).toEqual(false)
		expect(engine.evaluate('test 2').value).toEqual(false)
	})
})
