import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Expressions > pourcentage', () => {
  it('constante', async () => {
    const engine = await yaml`

constante:
  valeur: 38.1%
    `
    expect(engine.evaluate('constante').value).toEqual(38.1)
    expect(engine.publicodes.outputs['constante'].type.unit).toBe('%')
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
    expect(engine.publicodes.outputs['soustraction'].type.unit).toBe('%')
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
    expect(engine.publicodes.outputs['multiplication'].type.unit).toBe('€')
  })
  it('inférence  dans les multiplications', async () => {
    const engine = await yaml`

salaire:
multiplication:
  unité: €
  valeur: 38.1% * salaire
`
    expect(engine.publicodes.outputs['salaire'].type.unit).toBe('€')
  })

  it('simplification dans les multiplications - 2', async () => {
    const engine = await yaml`
    a: 50W / 200% #25W
    b: 10 %/étoiles * 5 étoiles #50%
    c: 40 kg * 50% #20kg
    d: 20 * 5% #100%
    `
    expect(engine.evaluate('a').value).toEqual(25)
    expect(engine.publicodes.outputs['a'].type.unit).toBe('W')
    expect(engine.evaluate('b').value).toEqual(50)
    expect(engine.publicodes.outputs['b'].type.unit).toBe('%')
    expect(engine.evaluate('c').value).toEqual(20)
    expect(engine.publicodes.outputs['c'].type.unit).toBe('kg')
    expect(engine.evaluate('d').value).toEqual(100)
    expect(engine.publicodes.outputs['d'].type.unit).toBe('%')
  })
})
