import { describe, it, expect, beforeAll } from 'vitest'
import yaml from 'yaml'
import Engine from '../src/index'
import { engineFromYaml } from './utils'

describe('une possibilité', () => {
	describe('References to rules', () => {
		let engine

		beforeAll(() => {
			engine = engineFromYaml(
				`
a:
  une possibilité:
    - b
    - c
  par défaut: "'b'"
  avec:
    b:
    c:
`,
				{ strict: true },
			)
		})

		it('Accept reference to defined rules', () => {
			expect(engine.evaluate('a').nodeValue).toEqual('b')
		})

		it('Can be modified with setSituation', () => {
			engine.setSituation({ a: "'c'" })
			expect(engine.evaluate('a').nodeValue).toEqual('c')
		})

		it('Throw an error if the value is not in the list', () => {
			expect(() => engine.setSituation({ a: "'d'" })).toThrow()
		})

		it('Do not allow a default value wich is not in the list', () => {
			// Todo : make this work at compile time
			const engine = engineFromYaml(
				`
a:
  une possibilité:
    - b
    - c
  par défaut: "'d'"
  avec:
    b:
    c:
    d:
`,
				{ strict: true },
			)

			expect(() => engine.evaluate('a')).toThrow()
		})

		it('Throw if the reference has not been defined', () => {
			expect(() =>
				engineFromYaml(
					`
a:
  une possibilité:
    - b
    - c
  par défaut: "'b'"
`,
					{ strict: true },
				),
			).toThrow()
		})

		it('Allows to use a reference to a rule that is not a direct child', () => {
			const engine = engineFromYaml(
				`
a:
  une possibilité:
    - b . a
    - c
  par défaut: "'b . a'"

b:
b . a:
c:
`,
			)
			expect(() => engine.getRule('a . b . a')).toThrow()
			expect(engine.evaluate('a').nodeValue).toEqual('b . a')
		})

		it('Disambiguates references', () => {
			const engine = engineFromYaml(
				`
a:
a . a:
  une possibilité:
    - b . a
a . b:
a . b . a:
`,
			)
			expect(
				engine.getRule('a . a').possibilities.explanation[0].dottedName,
			).toEqual('a . b . a')
		})

		it('Throws if empty', () => {
			expect(() =>
				engineFromYaml(`
a:
  une possibilité:
`),
			).toThrow('Erreur syntaxique')
		})
	})

	describe('Inlined rules', () => {
		it('Creates new rules', () => {
			const engine = engineFromYaml(
				`
a:
  une possibilité:
    - b:
`,
			)
			expect(engine.getRule('a . b')).toBeTruthy()
		})

		it('Throws if the rule is defined twice in possibility', () => {
			expect(() =>
				engineFromYaml(
					`
a:
  une possibilité:
    - b:
    - b:
`,
				),
			).toThrow('Erreur syntaxique')
		})

		it('Throws if the rule is also defined elswhere', () => {
			expect(() =>
				engineFromYaml(
					`
a:
  une possibilité:
    - b:
  avec:
    b:
`,
				),
			).toThrow('Erreur syntaxique')
		})

		it('Ok to mix with references', () => {
			const engine = engineFromYaml(
				`
a:
  une possibilité:
    - b
    - c:
  avec:
    b:
`,
			)
			expect(engine.getRule('a . c').title).toEqual('C')
		})

		it('Do not allow mix with string', () => {
			expect(() =>
				engineFromYaml(
					`
a:
  une possibilité:
    - b:
    - "'c'"

`,
				),
			).toThrow('Erreur syntaxique')
		})

		it('Do not allow mix with number', () => {
			expect(() =>
				engineFromYaml(
					`
a:
  une possibilité:
    - b:
    - 12
		`,
				),
			).toThrow('Erreur syntaxique')
		})

		it('Do not allow ambiguity', () => {
			expect(() =>
				engineFromYaml(
					`
b:
a:
  une possibilité:
    - b:
    - b
`,
				),
			).toThrow('Erreur syntaxique')
		})

		it('Only one rule by possibility', () => {
			expect(() =>
				engineFromYaml(
					`
a:
  une possibilité:
    - b:
      c:
`,
				),
			).toThrow('Erreur syntaxique')
		})
	})

	describe('Number constant', () => {
		const engine = engineFromYaml(
			`
a:
  une possibilité:
    - 4 pièces
    - 5 pièces
    - 6 pièces
  par défaut: 4 pièces
`,
			{ strict: true },
		)
		it('Accept number constant', () => {
			expect(engine.evaluate('a').nodeValue).toEqual(4)
		})
		it('Can be modified with setSituation', () => {
			engine.setSituation({ a: '5 pièces' })
			expect(engine.evaluate('a').nodeValue).toEqual(5)
		})
		it('Throw an error if the value is not in the list', () => {
			expect(() => engine.setSituation({ a: 3 })).toThrow()
		})
		it('Throw an error if the unit if wrong', () => {
			expect(() => engine.setSituation({ a: '5 mètres' })).toThrow()
		})
		it('Do not allow different units', () => {
			const rules = yaml.parse(
				`
a:
  une possibilité:
    - 4 mètres
    - 5 pièces
  `,
			)
			expect(() => new Engine(rules, { strict: true })).toThrow()
		})
		it('Allows unit conversion', () => {
			const rules = yaml.parse(
				`
a:
  une possibilité:
    - 2 m
    - 50 cm
  par défaut: 200 cm
`,
			)
			const engine = new Engine(rules, { strict: true })
			expect(engine.evaluate('a').nodeValue).toEqual(200)
		})

		describe('getPossibilitiesFor', () => {
			it('Returns string constant possibility', () => {
				const engine = engineFromYaml(`
fruits:
  une possibilité:
    - "'pomme'"
    - "'banane'" `)
				const possibilities = engine.getPossibilitiesFor('fruits')
				expect(possibilities[0]).toMatchObject({
					type: 'string',
					publicodesValue: "'pomme'",
					nodeValue: 'pomme',
				})
				expect(possibilities[0].notApplicable.nodeValue).toBe(false)
			})

			it('Returns numeric possibility with unit structure', () => {
				const engine = engineFromYaml(`
poids:
  une possibilité:
    - 1 kg
    - 2 kg`)
				const possibilities = engine.getPossibilitiesFor('poids')
				expect(possibilities[0]).toMatchObject({
					type: 'number',
					publicodesValue: '1 kg',
					nodeValue: 1,
					unit: { numerators: ['kg'], denominators: [] },
				})
			})

			it('Returns reference possibility structure', () => {
				const engine = engineFromYaml(`
choix:
  une possibilité:
    - option1:
    - option2:`)
				const possibilities = engine.getPossibilitiesFor('choix')
				expect(possibilities[0]).toMatchObject({
					type: 'reference',
					dottedName: 'choix . option1',
					nodeValue: 'option1',
					publicodesValue: "'option1'",
				})
			})

			it('filterNotApplicable removes non applicable possibilities', () => {
				const engine = engineFromYaml(
					`
choix:
  une possibilité:
    - option1:
        non applicable si: oui
    - option2:
    - option3:`,
					{
						flag: {
							filterNotApplicablePossibilities: true,
						},
					},
				)
				const possibilities = engine.getPossibilitiesFor('choix', {
					filterNotApplicable: true,
				})
				expect(possibilities).toHaveLength(2)
				expect(possibilities[0].dottedName).toEqual('choix . option2')
			})

			it('filterNotApplicable keeps all possibilities when no conditions', () => {
				const engine = engineFromYaml(
					`
choix:
  une possibilité:
    - option1:
    - option2:`,
					{
						flag: {
							filterNotApplicablePossibilities: true,
						},
					},
				)

				const possibilities = engine.getPossibilitiesFor('choix', {
					filterNotApplicable: true,
				})
				expect(possibilities).toHaveLength(2)
			})
		})
	})
})
