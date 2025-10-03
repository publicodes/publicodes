import { describe, it, expect, beforeAll } from 'bun:test'
import { TestPublicodes, yaml } from '../../utils/compile'

describe('Metas > allowed metas', () => {
	let engine: TestPublicodes
	beforeAll(async () => {
		engine = await yaml`
a:
  titre: ma règle
  description: ma description
  note: |
    mes notes
  valeur: 5
  meta:
    references:
      - https://calinou.coop
    ui:
      question: Quel est votre couleur préférée ?
      tooltip: |
        Petite aide contextuelle
`
	})

	it('title', () => {
		expect(engine.getMeta('a').title).toEqual('ma règle')
	})

	it('description', () => {
		expect(engine.getMeta('a').description).toEqual('ma description')
	})

	it('note', () => {
		expect(engine.getMeta('a').note).toEqual('mes notes\n')
	})

	it('meta object', () => {
		expect(engine.getMeta('a').references).toEqual(['https://calinou.coop'])
		expect(engine.getMeta('a').ui).toEqual({
			question: 'Quel est votre couleur préférée ?',
			tooltip: 'Petite aide contextuelle\n',
		})
	})
})
