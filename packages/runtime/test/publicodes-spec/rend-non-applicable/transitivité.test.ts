import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Rend non applicable > transitivité', async () => {
  it('simple', async () => {
    let engine = await yaml`
    a:
      valeur: oui
      rend non applicable: b
    b:
      valeur: oui
      rend non applicable: c # doesn't apply because b is not applicable because of a

    c: oui
    x: c
  `
    expect(engine.evaluate('x').value).toBe(true)
  })

  it('simple', async () => {
    let engine = await yaml`
    a:
      valeur: oui
      rend non applicable: b
    b:
      valeur: oui
      rend non applicable: c
    c:
      valeur: oui
      rend non applicable: d  # apply because b is not applicable because of a

    d: oui
    x: d
  `
    expect(engine.evaluate('x').value).toBe(null)
  })
})
