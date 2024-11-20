import { expect } from 'chai'
import { test } from 'mocha'
import Engine from '../src/index'
import { inputDetails } from '../src/inputDetails'

function inputForRule(rule) {
	const engine = new Engine({
		a: rule,
	})
	return inputDetails(engine, 'a')
}

describe('inputDetails', function () {
	test('returns null if the rule is not defined', function () {
		expect(inputForRule({})).to.equal(null)
	})
	describe('for boolean rules', function () {
		test('checkbox input by default', function () {
			expect(inputForRule({ valeur: 'oui' })).to.deep.equal({
				element: 'input',
				type: 'checkbox',
			})
		})
		test('oui / non input if there is a question', function () {
			expect(inputForRule({ question: 'Quel est ?' })).to.deep.equal({
				element: 'radioGroup',
				orientation: 'horizontal',
				style: 'button',
				options: [
					{ value: true, label: 'Oui' },
					{ value: false, label: 'Non' },
				],
			})
		})
	})
	describe('for string rules', function () {
		test('text input by default', function () {
			expect(inputForRule("''")).to.deep.equal({
				element: 'input',
				type: 'text',
			})
		})
		test('textarea if specified', function () {
			expect(
				inputForRule({
					type: 'texte',
					saisie: 'texte long',
				}),
			).to.deep.equal({
				element: 'textarea',
			})
		})
	})
	test('for number rules', function () {
		expect(inputForRule(0)).to.deep.equal({
			element: 'input',
			type: 'number',
		})
	})

	test('for date rules', function () {
		expect(inputForRule({ type: 'date' })).to.deep.equal({
			element: 'input',
			type: 'date',
		})
	})

	test('for enum rules', function () {
		expect(inputForRule({ 'choix possibles': ['1', '2'] })).to.deep.equal({
			element: 'select',
			options: [
				{ value: 1, label: '1' },
				{ value: 2, label: '2' },
			],
		})
	}
})
