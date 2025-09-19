import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Remplace > priorité', async () => {
  it('simple', async () => {
    let engine = await yaml`
    a:
      remplace:
        références à: c
        priorité: 1
      valeur: 1
    b:
      remplace: c
      valeur: 2
    c:
    x: c
  `
    expect(engine.evaluate('x').value).toBe(1)
  })

  it('non applicable', async () => {
    let engine = await yaml`
    a:
      non applicable si: oui
      remplace:
        références à: c
        priorité: 1
      valeur: 1
    b:
      remplace: c
      valeur: 2
    c:
    x: c
  `
    expect(engine.evaluate('x').value).toBe(2)
  })
})
