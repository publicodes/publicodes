import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Remplace > transitivité', async () => {
  it('simple', async () => {
    let engine = await yaml`
    a:
      remplace: b
      valeur: 1
    b:
      remplace: c
      valeur: 2
    c: 3
    x: c
  `
    expect(engine.evaluate('x').value).toBe(1)
  })

  it('non applicable', async () => {
    let engine = await yaml`
    a:
      applicable si: non
      remplace: b
      valeur: 1
    b:
      remplace: c
      valeur: 2
    c:
      remplace: d
      valeur: 3
    d: 4
    x: d
  `
    expect(engine.evaluate('x').value).toBe(2)
  })
})
