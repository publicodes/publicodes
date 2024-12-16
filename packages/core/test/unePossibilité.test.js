import { expect } from 'chai'
import { test } from 'mocha'
import yaml from 'yaml'
import Engine from '../src/index'

describe('une possibilité', function () {
	describe('Already defined rules', function () {
		const engine = new Engine(
			yaml.parse(
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
			),
			{ strict: true },
		)
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
		test('Should not allow a default value wich is not in the list', function () {
			// Todo : make this work at compile time
			const engine = new Engine(
				yaml.parse(
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
				),
				{ strict: true },
			)

			expect(() => engine.evaluate('a')).throws()
		})
	})

	describe('Not already defined rules', function () {
		test('Create rule if the reference has not been defined elsewhere', function () {
			const engine = new Engine(
				yaml.parse(
					`
a:
  une possibilité:
    - b
	- c
  par défaut: "'b'"
`,
				),
				{ strict: true },
			)
			expect(() => engine.getRule('a . b')).not.to.throw()
			expect(engine.evaluate('a . b').nodeValue).to.eql(undefined)
		})
	})

	describe('Number constant', function () {
		const engine = new Engine(
			yaml.parse(
				`
a:
  une possibilité:
    - 4 pièces
    - 5 pièces
    - 6 pièces
  par défaut: 4 pièces
`,
			),
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
		test('Should not allow different units', function () {
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
  unité: cm
  une possibilité:
	- 2 m
	- 50 cm
  par défaut: 2 m
`,
			)
			const engine = new Engine(rules, { strict: true })
			expect(engine.evaluate('a').nodeValue).to.eql(200)
		})
	})
})
