import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import Engine from '../src/index'
import { engineFromYaml, parseYaml } from './utils'

describe('setSituation', () => {
	it('should allow to evaluate without situation', () => {
		expect(engineFromYaml('a: ').evaluate('a').nodeValue).toBe(undefined)
	})

	it('should allow to evaluate with situation set', () => {
		expect(
			engineFromYaml('a: ').setSituation({ a: 5 }).evaluate('a').nodeValue,
		).toBe(5)
	})

	it('should overwrite initial value with situation', () => {
		expect(
			engineFromYaml('a: 10').setSituation({ a: 5 }).evaluate('a').nodeValue,
		).toBe(5)
	})

	it('should not allow to set situation for private rule', () => {
		expect(() =>
			engineFromYaml('[privé] a: 10').setSituation({ a: 5 }),
		).toThrow()
	})

	it('should report missing variables depth first', () => {
		expect(
			engineFromYaml('a:\nb: a').evaluate('b').missingVariables,
		).to.have.all.keys('a')
	})

	it('should not show private missing variables', () => {
		expect(
			engineFromYaml('"[privé] a":\nb: a').evaluate('b').missingVariables,
		).to.have.all.keys('b')
	})

	it('should let the user reference rules in the situation', () => {
		const rules = parseYaml(`
	referenced in situation:
	  formule: 200
	overwrited in situation:
	  formule: 100
	result:
	  formule: overwrited in situation + 22
	`)
		const engine = new Engine(rules)
		engine.setSituation({
			'overwrited in situation': 'referenced in situation',
		})
		expect(engine.evaluate('result').nodeValue).to.equal(222)
	})

	it('should allow to create rules in the situation', () => {
		const engine = engineFromYaml('a:')
		engine.setSituation({
			a: {
				valeur: 'b',
				avec: {
					b: 5,
				},
			},
		})
		expect(engine.evaluate('a').nodeValue).to.equal(5)
	})

	it('should allow to replace rules in the situation', () => {
		const engine = engineFromYaml('a: 5\nb:')
		engine.setSituation({
			b: {
				valeur: 10,
				remplace: 'a',
			},
		})
		expect(engine.evaluate('a').nodeValue).to.equal(10)
	})

	it('should allow to keep previous situation', () => {
		const engine = engineFromYaml('a:\nb:\nc:')
			.setSituation({ a: 5, c: 3 })
			.setSituation({ b: 10, c: 'a' }, { keepPreviousSituation: true })
		expect(engine.evaluate('a').nodeValue).to.equal(5)
		expect(engine.evaluate('b').nodeValue).to.equal(10)
		expect(engine.evaluate('c').nodeValue).to.equal(5)
	})

	it('context rules should not be added in the situation with keepPreviousSituation', () => {
		const engine = new Engine(
			parse(`
a:
  formule: b
  contexte:
    b: 50
b: 10
c: 20
`),
		).setSituation({ c: 100 }, { keepPreviousSituation: true })
		engine.evaluate('a')
		const filteredSituation = engine.getSituation()
		expect(filteredSituation).to.deep.equal({ c: 100 })
	})

	it('should allow to make a rule applicable in the situation', () => {
		const engine = engineFromYaml(`
a:
  par défaut: non
a . b: 5
		`).setSituation({ a: 'oui' })
		expect(engine.evaluate('a').nodeValue).to.equal(true)
		expect(engine.evaluate('a . b').nodeValue).to.equal(5)
	})

	it('should filter wrong situation when `strict` option is set to `false`', () => {
		const engine = new Engine(
			parse(`
a:
  une possibilité:
    - b:
    - c:
    - d:
`),
			{
				logger: { log: () => {}, warn: () => {}, error: () => {} },
				strict: {
					situation: false,
				},
			},
		).setSituation({ 'règle non valide': 10, a: "'valeur non valide'" })

		const filteredSituation = engine.getSituation()
		expect(filteredSituation).to.deep.equal({})
	})

	it('should raise an error when rule in situation is absent in base rules', () => {
		const engine = engineFromYaml(`
a:
`)

		expect(() => engine.setSituation({ 'règle non valide': 10 })).toThrow(
			`[ Erreur lors de la mise à jour de la situation ]
➡️  Dans la règle "règle non valide"
✖️  'règle non valide' n'existe pas dans la base de règle.`,
		)
	})

	it('should raise an error when situation value is not a possible answer in base rules', () => {
		const engine = engineFromYaml(
			`
a:
  une possibilité:
      - b
      - c
      - d
  avec:
    b:
    c:
    d:
`,
			{
				strict: {
					checkPossibleValues: true,
				},
			},
		)
		expect(() => engine.setSituation({ a: "'valeur non valide'" })).toThrow(
			`[ Erreur lors de la mise à jour de la situation ]
➡️  Dans la règle "a"
✖️  La valeur 'valeur non valide' ne fait pas parti des possibilités applicables listées pour cette règle.`,
		)
	})

	it('should keep previous situation when an error occurs in setSituation', () => {
		const engine = engineFromYaml(`
a:
`)
		engine.setSituation({ a: 10 })

		try {
			engine.setSituation({ a: 'non valide' })
		} catch (e) {
			expect(engine.evaluate('a').nodeValue).to.equal(10)
		}
	})

	it('should allow to reset a rule when use keepPreviousSituation first', () => {
		const engine = engineFromYaml(`
a:
`)
		engine.setSituation({ a: 10 }, { keepPreviousSituation: true })
		engine.setSituation({})
		const missings = engine.evaluate('a').missingVariables
		expect(missings).to.have.all.keys('a')
	})
})
