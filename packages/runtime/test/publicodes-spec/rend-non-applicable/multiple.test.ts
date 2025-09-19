import { describe, it, expect } from 'bun:test'
import { yaml } from '../../utils/compile'

describe('Rend non applicable > multiple', async () => {
  let engine = await yaml`
  a:
    rend non applicable: c

  b:
    rend non applicable: c
  c:
  x: c
`
  it('tous applicable', async () => {
    expect(
      engine.evaluate('x', {
        a: true,
        b: true,
      }).value,
    ).toBe(null)
  })

  it('un seul applicable', async () => {
    expect(engine.evaluate('x', { a: true }).value).toBe(null)
    expect(engine.evaluate('x', { b: true }).value).toBe(null)
  })

  it('aucun applicable', async () => {
    expect(engine.evaluate('x', { a: false, b: false }).value).toBe(undefined)
  })
})
