import Engine from 'publicodes'
import { describe, expect, it } from 'vitest'
import {
	CheckboxWithValue,
	evaluateFormElement,
	OptionsGroupWithValue,
	TextareaWithValue,
} from './evaluateFormElement'
import { FormElement } from './formElement'

describe('evaluateFormElement', () => {
	it('should evaluate checkbox', () => {
		const engine = new Engine({
			'ma checkbox': 'oui',
		})

		const formElement: FormElement = {
			element: 'input',
			type: 'checkbox',
			id: 'ma checkbox',
			label: 'Ma checkbox',
			description: undefined,
		}

		const result = evaluateFormElement(
			engine,
			formElement,
		) as CheckboxWithValue & { isApplicable: true }

		expect(result.isApplicable).toBe(true)
		expect(result.checked).toBe(false)
		expect(result.defaultChecked).toBe(true)
	})

	it('should evaluate radio group', () => {
		const engine = new Engine({
			'mon choix': {
				'une possibilité': ["'opt1'", "'opt2'"],
			},
		})

		const formElement: FormElement = {
			element: 'RadioGroup',
			id: 'mon choix',
			label: 'Mon choix',
			description: undefined,
			style: 'default',
			orientation: 'vertical',
			options: [
				{ value: "'opt1'", label: 'Opt1' },
				{ value: "'opt2'", label: 'Opt2' },
			],
		}

		const result = evaluateFormElement(
			engine,
			formElement,
		) as OptionsGroupWithValue & { isApplicable: true }
		expect(result.isApplicable).toBe(true)
		expect(result.value).toBe(undefined)
		expect(result.defaultValue).toBe(undefined)
		const options = result.options

		expect(options).toHaveLength(2)

		options.forEach((option) => {
			expect(option.isApplicable).toBe(true)
		})
	})

	it('should handle default values and situation override', () => {
		const engine = new Engine({
			'mon choix': {
				'par défaut': 12,
				'une possibilité': [12, 42],
			},
		})
		engine.setSituation({
			'mon choix': 42,
		})

		const formElement: FormElement = {
			element: 'RadioGroup',
			id: 'mon choix',
			label: 'Mon choix',
			description: undefined,
			style: 'default',
			orientation: 'vertical',
			options: [
				{ value: 12, label: '12' },
				{ value: 42, label: '42' },
			],
		}

		const result = evaluateFormElement(
			engine,
			formElement,
		) as OptionsGroupWithValue & { isApplicable: true }
		expect(result.isApplicable).toBe(true)
		expect(result.value).toEqual(42)
		expect(result.defaultValue).toEqual(12)
	})

	it('should handle non applicable options', () => {
		const engine = new Engine({
			'mon choix': {
				valeur: "'opt2'",
				'une possibilité': [
					{
						opt1: {
							'applicable si': 'non',
						},
					},
					"'opt2'",
					"'opt3'",
				],
			},
		})

		const formElement: FormElement = {
			element: 'RadioGroup',
			id: 'mon choix',
			label: 'Mon choix',
			description: undefined,
			style: 'default',
			orientation: 'vertical',
			options: [
				{ value: "'opt1'", label: 'Opt1' },
				{ value: "'opt2'", label: 'opt2' },
				{ value: "'opt3'", label: 'opt3' },
			],
		}

		const result = evaluateFormElement(
			engine,
			formElement,
		) as OptionsGroupWithValue & { isApplicable: true }
		expect(result.isApplicable).toBe(true)
		const options = result.options
		expect(options).toHaveLength(3)
		expect(options[0].isApplicable).toBe(false)
		expect(options[1].isApplicable).toBe(true)
		expect(options[2].isApplicable).toBe(true)
	})

	it('should evaluate textarea element', () => {
		const engine = new Engine({
			'mon texte': {
				valeur: "'Un long texte'",
				saisie: 'texte long',
			},
		})

		engine.setSituation({
			'mon texte': "'Un texte long'",
		})

		const formElement: FormElement = {
			element: 'textarea',
			id: 'mon texte',
			label: 'Test Textarea',
			description: undefined,
		}

		const result = evaluateFormElement(
			engine,
			formElement,
		) as TextareaWithValue & {
			isApplicable: true
		}
		expect(result.isApplicable).toBe(true)
		expect(result.value).toEqual('Un texte long')
		expect(result.defaultValue).toEqual('Un long texte')
	})
})
