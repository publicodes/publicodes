import { describe, it, expect } from 'bun:test'
import { yaml } from '../compile'

describe('Expressions > division', () => {
	it('division', async () => {
		const { division } = await yaml`

salaire de base:
  unité: ¥

division:
  valeur: salaire de base / 3
`
		expect(division.evaluate({ 'salaire de base': 3000 }).value).toEqual(1000)
		expect(division.unit).toBe('¥')
	})

	it('division inverse', async () => {
		const { division } = await yaml`

salaire de base:
  unité: ¥

division:
  valeur: 3 / salaire de base
`
		expect(division.evaluate({ 'salaire de base': 3000 }).value).toEqual(0.001)
		expect(division.unit).toBe('/¥')
	})

	it('division par zéro', async () => {
		const { division } = await yaml`

x: 0

division:
  valeur: 3 / x
`
		expect(() => division.evaluate({}).value).toThrowError(
			'Division by zero: 3 / 0',
		)
	})

	it('division et modulo', async () => {
		const engine = await yaml`

division: 5 // 2
modulo: 5 /% 2
both: 5 // 2 + 5 /% 2
`
		expect(engine.division.evaluate().value).toEqual(2)
		expect(engine.modulo.evaluate().value).toEqual(1)
		expect(engine.both.evaluate().value).toEqual(3)
	})

	it('spécification modulo', async () => {
		const engine = await yaml`
a: 117 /% 17
b: -117 /% 17
c: -117 /% -17
d: 117 /% -17
e: 12.7 /% 3.5
`
		expect(engine['a'].evaluate().value).toBeCloseTo(15)
		expect(engine['b'].evaluate().value).toBeCloseTo(-15)
		expect(engine['c'].evaluate().value).toBeCloseTo(-15)
		expect(engine['d'].evaluate().value).toBeCloseTo(15)
		expect(engine['e'].evaluate().value).toBeCloseTo(2.2)
	})

	it('spécification quotient', async () => {
		const engine = await yaml`
a: 117 // 17
b: -117 // 17
c: -117 // -17
d: 117 // -17
e: 12.7 // 3.5
`

		expect(engine['a'].evaluate().value).toBeCloseTo(6)
		expect(engine['b'].evaluate().value).toBeCloseTo(-6)
		expect(engine['c'].evaluate().value).toBeCloseTo(6)
		expect(engine['d'].evaluate().value).toBeCloseTo(-6)
		expect(engine['e'].evaluate().value).toBeCloseTo(3)
	})
})
