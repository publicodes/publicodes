import { describe, it, expect } from 'vitest'
import { yaml } from '../utils/compile'
describe('Expressions', () => {
  it('should evaluate expressions correctly', async () => {
    const engine = await yaml`
      entier:
        public: oui
        valeur: 5 €
      `
    expect(engine.evaluate('entier')).toMatchObject({
      value: 5,
      neededParameters: [],
    })
  })
})
