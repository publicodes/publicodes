import { expect } from 'chai'
import { test } from 'mocha'
import yaml from 'yaml'
import Engine from '../src/index'
import { engineFromYaml } from './utils'

describe('une possibilité', function () {
	describe('References to rules', function () {
		/**
		 * @type {Engine}
		 */
		let engine

		before(function () {
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

		test('Accept reference to defined rules', function () {
			expect(engine.evaluate('a').nodeValue).to.eql('b')
		})
		test('Can be modified with setSituation', function () {
			engine.setSituation({ a: "'c'" })
			expect(engine.evaluate('a').nodeValue).to.eql('c')
		})
		test('Throw an error if the value is not in the list', function () {
			expect(() => engine.setSituation({ a: "'d'" })).throws()
		})

		test('Do not allow a default value wich is not in the list', function () {
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

			expect(() => engine.evaluate('a')).throws()
		})

		test('Throw if the reference has not been defined', function () {
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
			).to.throw()
		})

		test('Allows to use a reference to a rule that is not a direct child', function () {
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
			expect(() => engine.getRule('a . b . a')).to.throw()
			expect(engine.evaluate('a').nodeValue).to.eql('b . a')
		})

		test('Disambiguates references', function () {
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
			).to.eql('a . b . a')
		})

		test('Throws if empty', function () {
			expect(() =>
				engineFromYaml(`
a:
  une possibilité:
`),
			).to.throw('Erreur syntaxique')
		})
	})

	describe('Inlined rules', function () {
		test('Creates new rules', function () {
			const engine = engineFromYaml(
				`
a:
  une possibilité:
    - b:
`,
			)
			expect(engine.getRule('a . b')).to.be.ok
		})

		test('Throws if the rule is defined twice in possibility', function () {
			expect(() =>
				engineFromYaml(
					`
a:
  une possibilité:
    - b:
    - b:
`,
				),
			).to.throw('Erreur syntaxique')
		})

		test('Throws if the rule is also defined elswhere', function () {
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
			).to.throw('Erreur syntaxique')
		})

		test('Ok to mix with references', function () {
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
			expect(engine.getRule('a . c').title).to.eql('C')
		})

		test('Do not allow mix with string', function () {
			expect(() =>
				engineFromYaml(
					`
a:
  une possibilité:
    - b:
    - "'c'"
  
`,
				),
			).to.throw('Erreur syntaxique')
		})

		test('Do not allow mix with number', function () {
			expect(() =>
				engineFromYaml(
					`
a:
  une possibilité:
    - b:
    - 12
		`,
				),
			).to.throw('Erreur syntaxique')
		})

		test('Do not allow ambiguity', function () {
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
			).to.throw('Erreur syntaxique')
		})

		test('Only one rule by possibility', function () {
			expect(() =>
				engineFromYaml(
					`
a:
  une possibilité:
    - b:
      c:
`,
				),
			).to.throw('Erreur syntaxique')
		})
	})

	describe('Number constant', function () {
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
		test('Accept number constant', function () {
			expect(engine.evaluate('a').nodeValue).to.eql(4)
		})
		test('Can be modified with setSituation', function () {
			engine.setSituation({ a: '5 pièces' })
			expect(engine.evaluate('a').nodeValue).to.eql(5)
		})
		test('Throw an error if the value is not in the list', function () {
			expect(() => engine.setSituation({ a: 3 })).throws()
		})
		test('Throw an error if the unit if wrong', function () {
			expect(() => engine.setSituation({ a: '5 mètres' })).throws()
		})
		test('Do not allow different units', function () {
			const rules = yaml.parse(
				`
a:
  une possibilité:
    - 4 mètres
    - 5 pièces
  `,
			)
			expect(() => new Engine(rules, { strict: true })).throws()
		})
		test('Allows unit conversion', function () {
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
			expect(engine.evaluate('a').nodeValue).to.eql(200)
		})

		describe('getPossibilitiesFor', function () {
			test('Returns string constant possibility', function () {
				const engine = engineFromYaml(`
fruits:
  une possibilité:
    - "'pomme'"
    - "'banane'" `)
				const possibilities = engine.getPossibilitiesFor('fruits')
				expect(possibilities[0]).to.deep.include({
					type: 'string',
					publicodesValue: "'pomme'",
					nodeValue: 'pomme',
				})
				expect(possibilities[0].notApplicable.nodeValue).to.be.false
			})

			test('Returns numeric possibility with unit structure', function () {
				const engine = engineFromYaml(`
poids:
  une possibilité:
    - 1 kg
    - 2 kg`)
				const possibilities = engine.getPossibilitiesFor('poids')
				expect(possibilities[0]).to.deep.include({
					type: 'number',
					publicodesValue: '1 kg',
					nodeValue: 1,
					unit: { numerators: ['kg'], denominators: [] },
				})
			})

			test('Returns reference possibility structure', function () {
				const engine = engineFromYaml(`
choix:
  une possibilité:
    - option1:
    - option2:`)
				const possibilities = engine.getPossibilitiesFor('choix')
				expect(possibilities[0]).to.deep.include({
					type: 'reference',
					dottedName: 'choix . option1',
					nodeValue: 'option1',
					publicodesValue: "'option1'",
				})
			})

			test('filterNotApplicable removes non applicable possibilities', function () {
				const engine = engineFromYaml(`
choix:
  une possibilité:
    - option1:
        non applicable si: oui
    - option2:
    - option3:`)
				const possibilities = engine.getPossibilitiesFor('choix', {
					filterNotApplicable: true,
				})
				expect(possibilities).to.have.length(2)
				expect(possibilities[0].dottedName).to.equal('choix . option2')
			})

			test('filterNotApplicable keeps all possibilities when no conditions', function () {
				const engine = engineFromYaml(`
choix:
  une possibilité:
    - option1:
    - option2:`)
				const possibilities = engine.getPossibilitiesFor('choix', {
					filterNotApplicable: true,
				})
				expect(possibilities).to.have.length(2)
			})
		})
	})
})
