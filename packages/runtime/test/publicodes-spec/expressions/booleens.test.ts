import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

const engine = await yaml`
a: oui
négation: a != oui
paramètre:
  type: booléen
`

describe('Expressions > booléens', () => {
  it('constante', async () => {
    expect(engine.evaluate('a').value).toEqual(true)
    expect(engine.publicodes.outputs['a'].type).toHaveProperty('boolean')
  })

  it('paramètre', async () => {
    expect(engine.evaluate('paramètre', { paramètre: true }).value).toEqual(
      true,
    )
    expect(engine.evaluate('paramètre', { paramètre: false }).value).toEqual(
      false,
    )
  })

  it('négation', async () => {
    expect(engine.evaluate('négation').value).toEqual(false)
    expect(engine.publicodes.outputs['négation'].type).toHaveProperty('boolean')
  })
})
