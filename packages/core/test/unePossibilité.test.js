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
				{ strict: true },
			),
		)
		test('Accept reference to defined rules', function () {
			engine.evaluate('a').nodeValue === "'b'"
		})
		test('Can be modified with setSituation', function () {
			engine.setSituation({ a: "'c'" })
			engine.evaluate('a').nodeValue === "'c'"
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
					{ strict: true },
				),
			)

			expect(() => engine.evaluate('a')).throws()
		})
	})

	describe('String constant', function () {
		const engine = new Engine(
			yaml.parse(
				`
a:
  une possibilité:
    - "'b'"
    - "'c'"
  par défaut: "'b'"
`,
				{ strict: true },
			),
		)
		test('Accept string constant', function () {
			engine.evaluate('a').nodeValue === "'b'"
		})
		test('Can be modified with setSituation', function () {
			engine.setSituation({ a: "'c'" })
			engine.evaluate('a').nodeValue === "'c'"
		})
		test('Throw an error if the value is not in the list', function () {
			expect(() => engine.setSituation({ a: "'d'" })).throws()
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
				{ strict: true },
			),
		)
		test('Accept number constant', function () {
			engine.evaluate('a').nodeValue === 4
		})
		test('Can be modified with setSituation', function () {
			engine.setSituation({ a: '5 pièces' })
			engine.evaluate('a').nodeValue === 5
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
				{ strict: true },
			)
			expect(() => new Engine(rules)).throws()
		})
	})

	describe('Inlined rule', function () {
		const engine = new Engine(
			yaml.parse(
				`
a:
  une possibilité:
    - a:
        titre: 'option A'
    - b:
        titre: 'option B'
    - c:
  par défaut: "'a'"
  
`,
				{ strict: true },
			),
		)
		test('Inlined rule have a boolean value', function () {
			expect(engine.evaluate('a . a').nodeValue).to.equal(true)
			expect(engine.evaluate('a . b').nodeValue).to.equal(false)
			expect(engine.evaluate('a . c').nodeValue).to.equal(false)
		})
	})
})
