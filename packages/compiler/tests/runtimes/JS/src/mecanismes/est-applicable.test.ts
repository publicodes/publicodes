import { describe, it, expect } from 'bun:test'
import { yaml } from '../compile'

describe('Mécanisme > est applicable', () => {
	it('simple', async () => {
		const { a } = await yaml`
a:
  est applicable: b

b: 10
`
		expect(a.evaluate().value).toBe(true)
	})

	it('avec non applicable', async () => {
		const { a } = await yaml`
a:
  est applicable: b

b: 10

c:
  valeur: oui
  rend non applicable: b
`
		expect(a.evaluate().value).toBe(false)
	})

	it('avec remplace', async () => {
		const { a } = await yaml`
a:
  est applicable: b

b: 10

c:
  valeur: 20
  remplace: b

d:
  valeur: oui
  rend non applicable: b
`
		expect(a.evaluate().value).toBe(false)
	})

	it('avec remplace complexe', async () => {
		const { a } = await yaml`
a: b

b: 10

c:
  valeur: 20
  remplace: b
  est applicable: d

d:
  valeur: oui
`
		expect(a.evaluate().value).toBe(20)
	})

	it('avec remplace non applicable', async () => {
		const { a } = await yaml`
a:
  est applicable: b

b: 10

c:
  valeur: 20
  remplace: b

d:
  valeur: oui
  rend non applicable: c
`
		expect(a.evaluate().value).toBe(true)
	})

	it('avec contexte fourni', async () => {
		const { a } = await yaml`
a:
  est applicable: b

b: 10

c:
  rend non applicable: b
`
		expect(a.evaluate({ c: true }).value).toBe(false)
	})

	it('avec contexte', async () => {
		const { a } = await yaml`
a:
  est applicable: b
  contexte:
    c: oui

b: 10

c:
  rend non applicable: b
`
		expect(a.evaluate().value).toBe(false)
	})

	it('chaine inversée', async () => {
		const { a } = await yaml`
a:
  est non applicable: b

b:
  est applicable: c

c:
  oui
`
		expect(a.evaluate().value).toBe(false)
	})

	it('chaine inversée 2', async () => {
		const { a } = await yaml`
a:
  est applicable: b

b:
  est non applicable: c

c:
  oui
`
		expect(a.evaluate().value).toBe(true)
	})
})
