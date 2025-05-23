import { FormOptions } from './formBuilder'
import Engine, { PublicodesError } from 'publicodes'
import { describe, expect, test } from 'vitest'
import { FormElement, getFormElement } from './formElement'

function inputForRule(
	rule: Record<string, unknown> | string | number,
	formOptions?: FormOptions,
) {
	const engine = new Engine({
		a: rule,
	})
	return getFormElement(engine, 'a', formOptions)
}

describe('inputDetails', function () {
	test('throw an error if the rule is not defined', function () {
		expect(() => inputForRule({})).toThrow(PublicodesError)
	})

	describe('for boolean rules', function () {
		test('checkbox input by default', function () {
			const input = inputForRule({ valeur: 'oui' })

			expect(input).toEqual({
				element: 'input',
				description: undefined,
				id: 'a',
				label: 'A',
				type: 'checkbox',
			})
		})

		test('oui / non input if there is a question', function () {
			expect(inputForRule({ question: 'Quel est ?' })).toEqual({
				element: 'RadioGroup',
				description: undefined,
				id: 'a',
				label: 'Quel est ?',
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
			expect(inputForRule("''")).toMatchObject({
				element: 'input',
				type: 'text',
			})
		})
		test('textarea if specified', function () {
			expect(
				inputForRule({
					type: 'texte',
					form: {
						saisie: 'texte long',
					},
				}),
			).toMatchObject({
				element: 'textarea',
			})
		})
	})
	test('for number rules', function () {
		expect(inputForRule(0)).toMatchObject({
			element: 'input',
			type: 'number',
		})
	})

	describe('for date rules', function () {
		test('date input', function () {
			expect(inputForRule('01/04/2012')).toMatchObject({
				element: 'input',
				type: 'date',
			})
		})
		test('month input', function () {
			expect(
				inputForRule({ type: 'date', form: { saisie: 'mois' } }),
			).toMatchObject({
				element: 'input',
				type: 'month',
			})
		})
	})

	describe('for "une possibilité" rules', function () {
		type InputWithOptions = FormElement & {
			options: NonNullable<unknown>
		}

		test('should be "RadioGroup" by default', function () {
			const input = inputForRule({ 'une possibilité': ["'a'", "'b'"] })

			expect(input.element).toBe('RadioGroup')
		})

		test('unless there is more than 5 possibilities', function () {
			const input = inputForRule({
				'une possibilité': [1, 2, 3, 4, 5, 6],
			})

			expect(input.element).toBe('select')
		})

		test('or another treshold if specify', function () {
			const input = inputForRule(
				{
					'une possibilité': [1, 2, 3, 4],
				},
				{
					selectTreshold: 3,
				},
			)

			expect(input.element).toBe('select')
		})

		test('should list the possible values in `options`', function () {
			const input = inputForRule({
				'une possibilité': ["'a'", "'b'"],
			}) as InputWithOptions
			expect(input).toHaveProperty('options')

			expect(input.options).toEqual([
				{ value: 'a', label: 'a' },
				{ value: 'b', label: 'b' },
			])
		})

		test('display number with unit in label', function () {
			const input = inputForRule({
				'une possibilité': ['1 €', '2 €'],
			}) as InputWithOptions

			expect(input.options).toEqual([
				{ value: 1, label: '1 €' },
				{ value: 2, label: '2 €' },
			])
		})

		test('should add metadata of children rule if it exists', function () {
			const input = inputForRule({
				'une possibilité': ['a', 'b'],
				avec: { a: { description: 'blabla' }, b: { titre: 'bloblo' } },
			}) as InputWithOptions

			expect(input.options).toEqual([
				{
					value: 'a',
					label: 'A',
					description: 'blabla',
				},
				{
					value: 'b',
					label: 'Bloblo',
					description: undefined,
				},
			])
		})
		describe('saisie options', function () {
			test('menu déroulant', function () {
				const input = inputForRule({
					'une possibilité': [1, 2],
					form: {
						saisie: 'menu déroulant',
					},
				})
				expect(input.element).toBe('select')
			})
			type InputRadio = FormElement & { element: 'RadioGroup' }
			test('boutons radio (horizontal if less than two element)', function () {
				const input = inputForRule({
					'une possibilité': [1, 2],
					form: {
						saisie: 'boutons radio',
					},
				}) as InputRadio
				expect(input.element).toBe('RadioGroup')
				expect(input.orientation).toBe('horizontal')

				const input2 = inputForRule({
					'une possibilité': [1, 2, 3],
					form: {
						saisie: 'boutons radio',
					},
				}) as InputRadio
				expect(input2.orientation).toBe('vertical')
			})

			test('carte', function () {
				const input = inputForRule({
					'une possibilité': [1, 2, 3, 4],
					form: {
						saisie: 'cartes',
					},
				}) as InputRadio
				expect(input.element).toBe('RadioGroup')
				expect(input.style).toBe('card')
				expect(input.orientation).toBe('horizontal')
			})

			test('orientation', function () {
				const input = inputForRule({
					'une possibilité': [1, 2],
					form: {
						saisie: 'boutons radio',
						orientation: 'vertical',
					},
				}) as InputRadio
				expect(input.orientation).toBe('vertical')
			})
		})
	})
})
