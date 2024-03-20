/* eslint-disable no-console */
import chai, { expect } from 'chai'
import 'mocha'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { parse } from 'yaml'
import Engine from '../src'

chai.use(sinonChai)

describe('When two different contexte are nested', () => {
	const rulesYaml = parse(`
a: 1
b: a * 2
c:
  valeur: b
  contexte:
      a: 10
d:
  valeur: c
  contexte:
    a: 100
`)
	const sandbox = sinon.createSandbox()

	beforeEach(() => {
		sandbox.spy(console, 'warn')
	})
	afterEach(() => {
		sandbox.restore()
	})
	describe('evaluation of rule on top of the chain', () => {
		it('evaluates to something', () => {
			expect(new Engine(rulesYaml).evaluate('d').nodeValue).to.eq(20)
		})

		it('does not throw any warning', () => {
			new Engine(rulesYaml).evaluate('d')
			expect(console.warn).to.have.not.been.called
		})
	})

	describe('evaluation of middle rule', () => {
		it('evaluates to something', () => {
			expect(new Engine(rulesYaml).evaluate('c').nodeValue).to.be.not.undefined
		})

		it('does not throw any warning', () => {
			new Engine(rulesYaml).evaluate('c')
			expect(console.warn).to.have.not.been.called
		})
	})
})

describe('When rule contains itself in the context', () => {
	const rules = {
		a: 100,
		b: {
			produit: ['a', '50%'],
			plafond: {
				valeur: 'b',
				contexte: {
					a: 50,
				},
			},
		},
	}
	const sandbox = sinon.createSandbox()

	beforeEach(() => {
		sandbox.spy(console, 'warn')
	})
	afterEach(() => {
		sandbox.restore()
	})
	describe('evaluation of rule', () => {
		it('evaluates properly', () => {
			expect(new Engine(rules).evaluate('b').nodeValue).to.eq(25)
		})

		it('does not throw any warning', () => {
			new Engine(rules).evaluate('b')
			expect(console.warn).to.have.not.been.called
		})
	})
})

describe('When we have a contexte and a situation with answers that should be taken into the "recalcul"', () => {
	const rules = {
		a: '10 * b',
		'a . b': {
			question: 'Combien ?',
			'par défaut': 100,
		},
		'a . c': {
			valeur: 'a',
			contexte: {
				b: '2 * b',
			},
		},
	}

	const situation = {
		'a . b': 5,
	}
	const sandbox = sinon.createSandbox()

	beforeEach(() => {
		sandbox.spy(console, 'warn')
	})
	afterEach(() => {
		sandbox.restore()
	})
	describe('evaluation of rule', () => {
		it('evaluates properly', () => {
			expect(
				new Engine(rules).setSituation(situation).evaluate('a . c').nodeValue,
			).to.eq(100)
		})
	})
})
