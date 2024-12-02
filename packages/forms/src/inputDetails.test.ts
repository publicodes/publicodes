import Engine from 'publicodes'
import { InputDetails, inputDetails } from './inputDetails'

function inputForRule(rule: Record<string, unknown> | string | number) {
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
			expect(inputForRule({ valeur: 'oui' })).to.deep.includes({
				element: 'input',
				type: 'checkbox',
			})
		})
		test('oui / non input if there is a question', function () {
			expect(inputForRule({ question: 'Quel est ?' })).to.deep.includes({
				element: 'RadioGroup',
				orientation: 'horizontal',
				style: 'button',
				options: [
					{ value: true, label: 'Oui', publicodesValue: 'oui' },
					{ value: false, label: 'Non', publicodesValue: 'non' },
				],
			})
		})
	})
	describe('for string rules', function () {
		test('text input by default', function () {
			expect(inputForRule("''")).to.deep.includes({
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
			).to.deep.includes({
				element: 'textarea',
			})
		})
	})
	test('for number rules', function () {
		expect(inputForRule(0)).to.deep.includes({
			element: 'input',
			type: 'number',
		})
	})

	describe('for date rules', function () {
		test('date input', function () {
			expect(inputForRule('01/04/2012')).to.deep.includes({
				element: 'input',
				type: 'date',
			})
		})
		test('month input', function () {
			expect(inputForRule({ type: 'date', saisie: 'mois' })).to.deep.includes({
				element: 'input',
				type: 'month',
			})
		})
	})

	describe('for "une possibilité" rules', function () {
		type InputWithOptions = InputDetails & { options: NonNullable<unknown> }
		it('should be "RadioGroup" by default', function () {
			const input = inputForRule({ 'une possibilité': ["'a'", "'b'"] })

			expect(input.element).to.equal('RadioGroup')
		})

		test('unless there is more than 5 possibilities', function () {
			const input = inputForRule({
				'une possibilité': [1, 2, 3, 4, 5, 6],
			})

			expect(input.element).to.equal('select')
		})

		test('should list the possible values in `options`', function () {
			const input = inputForRule({
				'une possibilité': ["'a'", "'b'"],
			}) as InputWithOptions

			expect(input).to.have.property('options')
			expect(input).to.deep.equal([
				{ value: 'a', label: 'a', publicodesValue: "'a'" },
				{ value: 'b', label: 'b', publicodesValue: "'b'" },
			])
		})

		test('display number with unit in label', function () {
			const input = inputForRule({
				'une possibilité': ['1 €', '2 €'],
			}) as InputWithOptions

			expect(input.options).to.deep.equal([
				{ value: 1, label: '1 €', publicodesValue: '1 €' },
				{ value: 2, label: '2 €', publicodesValue: '2 €' },
			])
		})

		test('should add metadata of children rule if it exists', function () {
			const input = inputForRule({
				'une possibilité': ['a', 'b'],
				avec: { a: { description: 'blabla' }, b: { titre: 'bloblo' } },
			}) as InputWithOptions

			expect(input.options).to.deep.equal([
				{
					value: 'a',
					label: 'A',
					publicodesValue: "'a'",
					description: 'blabla',
				},
				{
					value: 'b',
					label: 'Bloblo',
					publicodesValue: "'b'",
					description: undefined,
				},
			])
		})
		describe('saisie options', function () {
			test('menu déroulant', function () {
				const input = inputForRule({
					'une possibilité': [1, 2],
					saisie: 'menu déroulant',
				})
				expect(input.element).to.equal('select')
			})
			type InputRadio = InputDetails & { element: 'RadioGroup' }
			test('boutons radio (horizontal if less than two element)', function () {
				const input = inputForRule({
					'une possibilité': [1, 2],
					saisie: 'boutons radio',
				}) as InputRadio
				expect(input.element).to.equal('RadioGroup')
				expect(input.orientation).to.equal('horizontal')

				const input2 = inputForRule({
					'une possibilité': [1, 2, 3],
					saisie: 'boutons radio',
				}) as InputRadio
				expect(input2.orientation).to.equal('vertical')
			})

			test('carte', function () {
				const input = inputForRule({
					'une possibilité': [1, 2, 3, 4],
					saisie: 'cartes',
				}) as InputRadio
				expect(input.element).to.equal('RadioGroup')
				expect(input.style).to.equal('card')
				expect(input.orientation).to.equal('horizontal')
			})

			test('orientation', function () {
				const input = inputForRule({
					'une possibilité': [1, 2],
					saisie: {
						style: 'boutons radio',
						orientation: 'vertical',
					},
				}) as InputRadio
				expect(input.orientation).to.equal('vertical')
			})
		})
	})
})
