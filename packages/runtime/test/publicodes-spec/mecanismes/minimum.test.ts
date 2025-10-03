import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Mécanisme > le minimum de', () => {
	it('simple', async () => {
		const engine = await yaml`
a:
  le minimum de:
    - 10
    - 4.4
    - -5
`
		expect(engine.evaluate('a').value).toEqual(-5)
	})

	it('une seule valeur', async () => {
		const engine = await yaml`
a:
  le minimum de:
    - -10
`
		expect(engine.evaluate('a').value).toEqual(-10)
	})

	it('valeur non définie', async () => {
		const engine = await yaml`
a:
  le minimum de:
    - 10 €
    - 4.4
    - b
b:
`
		expect(engine.evaluate('a').value).toEqual(undefined)
		expect(engine.getType('b').unit).toEqual('€')
	})

	it('valeur non applicable', async () => {
		const engine = await yaml`
a:
  le minimum de:
    - 10 %
    - 4.4
    - b
b:
  non applicable si: oui
`
		expect(engine.evaluate('a').value).toEqual(4.4)
	})
})
