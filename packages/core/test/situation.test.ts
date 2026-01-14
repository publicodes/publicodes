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
			Object.keys(engineFromYaml('a:\nb: a').evaluate('b').missingVariables),
		).toEqual(['a'])
	})

	it('should not show private missing variables', () => {
		expect(
			Object.keys(
				engineFromYaml('"[privé] a":\nb: a').evaluate('b').missingVariables,
			),
		).toEqual(['b'])
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
		expect(engine.evaluate('result').nodeValue).toBe(222)
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
		expect(engine.evaluate('a').nodeValue).toBe(5)
	})

	it('should allow to replace rules in the situation', () => {
		const engine = engineFromYaml('a: 5\nb:')
		engine.setSituation({
			b: {
				valeur: 10,
				remplace: 'a',
			},
		})
		expect(engine.evaluate('a').nodeValue).toBe(10)
	})

	it('should allow to keep previous situation', () => {
		const engine = engineFromYaml('a:\nb:\nc:')
			.setSituation({ a: 5, c: 3 })
			.setSituation({ b: 10, c: 'a' }, { keepPreviousSituation: true })
		expect(engine.evaluate('a').nodeValue).toBe(5)
		expect(engine.evaluate('b').nodeValue).toBe(10)
		expect(engine.evaluate('c').nodeValue).toBe(5)
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
		expect(filteredSituation).toEqual({ c: 100 })
	})

	it('should allow to make a rule applicable in the situation', () => {
		const engine = engineFromYaml(`
a:
  par défaut: non
a . b: 5
		`).setSituation({ a: 'oui' })
		expect(engine.evaluate('a').nodeValue).toBe(true)
		expect(engine.evaluate('a . b').nodeValue).toBe(5)
	})

	// NOTE: in this case the strict mode option `checkPossibleValues` is false by
	// default, so this should not raise an error if not set to true.
	it.skip('should raise an error when `situation` strict mode option is set to `true`', () => {
		const engine = new Engine(
			parse(`
a:
  une possibilité:
    - b:
    - c:
    - d:
`),
			{
				strict: {
					situation: true,
				},
			},
		)
		expect(() => engine.setSituation({ a: "'valeur non valide'" })).toThrow(
			`[ Erreur lors de la mise à jour de la situation ]
➡️  Dans la règle "a"
✖️  La valeur "valeur non valide" ne fait pas partie des possibilités applicables listées pour cette règle.`,
		)
	})

	it('should filter wrong situation when `situation` strict mode option is set to `false`', () => {
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
		expect(filteredSituation).toEqual({})
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
					situation: false,
					checkPossibleValues: true,
				},
			},
		)
		expect(() => engine.setSituation({ a: "'valeur non valide'" })).toThrow(
			`[ Erreur lors de la mise à jour de la situation ]
➡️  Dans la règle "a"
✖️  La valeur "valeur non valide" ne fait pas partie des possibilités applicables listées pour cette règle.`,
		)
	})

	it('should keep previous situation when an error occurs in setSituation', () => {
		const engine = engineFromYaml(`
a:
`)
		engine.setSituation({ a: 10 })

		try {
			engine.setSituation({ a: 'non valide' })
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			expect(engine.evaluate('a').nodeValue).toBe(10)
		}
	})

	it('should allow to reset a rule when use keepPreviousSituation first', () => {
		const engine = engineFromYaml(`
a:
`)
		engine.setSituation({ a: 10 }, { keepPreviousSituation: true })
		engine.setSituation({})
		const missings = engine.evaluate('a').missingVariables
		expect(Object.keys(missings)).toEqual(['a'])
	})

	it('should correctly manage situation with non-applicable possibilities', () => {
		const engine = engineFromYaml(
			`
a:
a . test:
  applicable si:
    toutes ces conditions:
      - est défini: a
      - a = oui
  une possibilité:
    - pos 1
    - pos 2
  avec:
    pos 1:
      titre: Pos 1
    pos 2:
      titre: Pos 2
`,
			{
				strict: { checkPossibleValues: false },
				flag: { filterNotApplicablePossibilities: true },
			},
		)

		engine.setSituation({
			'a . test': "'pos 1'",
		}),
			expect(engine.evaluate('a . test').nodeValue).toEqual(null)

		engine.setSituation({
			a: 'oui',
		})
		engine.setSituation(
			{
				'a . test': "'pos 1'",
			},
			{ keepPreviousSituation: true },
		)
		expect(engine.evaluate('a . test').nodeValue).toEqual('pos 1')

		engine.setSituation({})
		engine.setSituation({
			a: 'oui',
			'a . test': "'pos 1'",
		})
		expect(engine.evaluate('a . test').nodeValue).toEqual('pos 1')

		engine.setSituation({
			a: 'non',
			'a . test': "'pos 1'",
		})
		expect(engine.evaluate({ 'est applicable': 'a . test' }).nodeValue).toEqual(
			false,
		)
	})
})
