import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Rend non applicable > avec remplace', async () => {
  it('rend non applicable take precedence over remplace', async () => {
    let engine = await yaml`
    a:
      remplace: c
      valeur: oui
    b:
      rend non applicable: c
      valeur: oui

    c:
    x: c
  `
    expect(engine.evaluate('x').value).toBe(null)
  })

  it('remplace «rend non applicable»', async () => {
    let engine = await yaml`
    a:
      valeur: oui
      remplace: b
    b:
      valeur: non
      rend non applicable: c

    c: oui

    x: c
  `
    expect(engine.evaluate('x').value).toBe(null)
  })
})
