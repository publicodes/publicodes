import { expect } from 'chai'
import Engine from '../source/index'

describe('setSituation', () => {
	it('should allow to evaluate without situation', () => {
		expect(new Engine('a: ').evaluate('a').nodeValue).to.eq(undefined)
	})
	it('should allow to evaluate with situation set', () => {
		expect(
			new Engine('a: ').setSituation({ a: 5 }).evaluate('a').nodeValue
		).to.eq(5)
	})
	it('should overwrite initial value with situation', () => {
		expect(
			new Engine('a: 10').setSituation({ a: 5 }).evaluate('a').nodeValue
		).to.eq(5)
	})
	it('should not allow to set situation for private rule', () => {
		expect(() => new Engine('[privé] a: 10').setSituation({ a: 5 })).to.throw
	})
	it('should report missing variables depth first', () => {
		expect(
			new Engine('a:\nb: a').evaluate('b').missingVariables
		).to.have.all.keys('a')
	})

	it('should not show private missing variables', () => {
		expect(
			new Engine('"[privé] a":\nb: a').evaluate('b').missingVariables
		).to.have.all.keys('b')
	})

	it('should let the user reference rules in the situation', function () {
		let rules = `
	referenced in situation:
	  formule: 200
	overwrited in situation:
	  formule: 100
	result:
	  formule: overwrited in situation + 22
	`
		let engine = new Engine(rules)
		engine.setSituation({
			'overwrited in situation': 'referenced in situation',
		})
		expect(engine.evaluate('result').nodeValue).to.equal(222)
	})

	it('should allow to create rules in the situation', function () {
		let engine = new Engine('a:')
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

	it('should allow to replace rules in the situation', function () {
		let engine = new Engine('a: 5\nb:')
		engine.setSituation({
			b: {
				valeur: 10,
				remplace: 'a',
			},
		})
		expect(engine.evaluate('a').nodeValue).to.equal(10)
	})

	it('should allow to keep previous situation', () => {
		let engine = new Engine('a:\nb:\nc:')
			.setSituation({ a: 5, c: 3 })
			.setSituation({ b: 10, c: 'a' }, { keepPreviousSituation: true })
		expect(engine.evaluate('a').nodeValue).to.equal(5)
		expect(engine.evaluate('b').nodeValue).to.equal(10)
		expect(engine.evaluate('c').nodeValue).to.equal(5)
	})
})
