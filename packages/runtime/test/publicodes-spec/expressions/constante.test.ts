import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'
const engine = await yaml`

entier: 5
décimal: 5.4
`

describe('Expressions > constantes', () => {
  it('entier', async () => {
    expect(engine.evaluate('entier').value).toEqual(5)
    expect(engine.outputs['entier'].type).toHaveProperty('number')
  })

  it('nombre décimal', async () => {
    expect(engine.evaluate('décimal').value).toEqual(5.4)
  })
})
