import { describe, expect, beforeAll, test } from 'bun:test'
import { TestPublicodes, yaml } from '../compile'

describe('Metas > allowed metas', () => {
	let a: TestPublicodes[string]
	beforeAll(async () => {
		a = (
			await yaml`
a:
  titre: ma règle avec l'apostrophe
  description: ma description "avec guillemets"
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
		).a
	})

	test('title', () => {
		expect(a.title).toBe("ma règle avec l'apostrophe")
	})

	test('description', () => {
		expect(a.description).toBe('ma description "avec guillemets"')
	})

	test('note', () => {
		expect(a.note).toBe('mes notes\n')
	})

	test('meta object', () => {
		expect(a.meta.references).toEqual(['https://calinou.coop'])
		expect(a.meta.ui).toEqual({
			question: 'Quel est votre couleur préférée ?',
			tooltip: 'Petite aide contextuelle\n',
		})
	})
})
