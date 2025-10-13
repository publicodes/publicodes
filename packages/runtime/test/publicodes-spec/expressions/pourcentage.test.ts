import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Expressions > pourcentage', () => {
	it('constante', async () => {
		const engine = await yaml`

constante:
  valeur: 38.1%
    `
		expect(engine.evaluate('constante').value).toEqual(38.1)
		expect(engine.outputs['constante'].type.unit).toBe('%')
	})

	it('soustraction', async () => {
		const engine = await yaml`
taux:
  unité: '%'

soustraction:
  valeur: 100% - taux
    `
		expect(
			engine.evaluate('soustraction', {
				taux: 89,
			}).value,
		).toEqual(11)
		expect(engine.outputs['soustraction'].type.unit).toBe('%')
	})

	it('simplification dans les multiplications', async () => {
		const engine = await yaml`

salaire:
  unité: €
multiplication:  38.1% * salaire
    `
		expect(
			engine.evaluate('multiplication', {
				salaire: 1000,
			}).value,
		).toEqual(381)
		expect(engine.outputs['multiplication'].type.unit).toBe('€')
	})
	it('inférence  dans les multiplications', async () => {
		const engine = await yaml`

salaire:
multiplication:
  unité: €
  valeur: 38.1% * salaire
`
		expect(engine.outputs['salaire'].type.unit).toBe('€')
	})

	it('simplification dans les multiplications - 2', async () => {
		const engine = await yaml`
    a: 50W / 200% #25W
    b: 10 %/étoiles * 5 étoiles #50%
    c: 40 kg * 50% #20kg
    d: 20 * 5% #100%
    `
		expect(engine.evaluate('a').value).toEqual(25)
		expect(engine.outputs['a'].type.unit).toBe('W')
		expect(engine.evaluate('b').value).toEqual(50)
		expect(engine.outputs['b'].type.unit).toBe('%')
		expect(engine.evaluate('c').value).toEqual(20)
		expect(engine.outputs['c'].type.unit).toBe('kg')
		expect(engine.evaluate('d').value).toEqual(100)
		expect(engine.outputs['d'].type.unit).toBe('%')
	})

	it.skip('addition with percentage', async () => {
		// When no unit is specified with a percentage, it should be considered as empty unit, not percentage
		const engine = await yaml`
a: 1 + 5%
b: 5 - 1%
`
		// @TODO
	})

	it.skip('addition with percentage', async () => {
		// When no unit is specified with a percentage, it should be considered as empty unit, not percentage
		expect(yaml`
a: 5% + 4
b: 2% + c
c: 4
`).toThrow()
	})
})
