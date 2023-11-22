import chai, { expect } from 'chai'
import 'mocha'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { parse } from 'yaml'
import Engine from '../source'
import { parseYaml } from './utils'

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
	const rulesYaml = parseYaml`
		a: 100 €
		r:
		  produit:
		    assiette: a
		    taux: 50%
		  plafond:
		    valeur: r
		    contexte:
		      a: 1000 €
`
	const sandbox = sinon.createSandbox()

	beforeEach(() => {
		sandbox.spy(console, 'warn')
	})
	afterEach(() => {
		sandbox.restore()
	})
	describe('evaluation of rule', () => {
		it('evaluates properly', () => {
			expect(new Engine(rulesYaml).evaluate('r').nodeValue).to.eq(50)
		})

		it('does not throw any warning', () => {
			new Engine(rulesYaml).evaluate('r')
			expect(console.warn).to.have.not.been.called
		})
	})
})
