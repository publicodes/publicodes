import Engine from 'publicodes'
import { describe, expect, it } from 'vitest'
import { EvaluatedRadioGroup } from '.'
import {
	EvaluatedCheckbox,
	EvaluatedNumberInput,
	EvaluatedTextarea,
	getEvaluatedFormElement,
} from './evaluatedFormElement'

describe('evaluateFormElement', () => {
	it('should evaluate checkbox', () => {
		const engine = new Engine({
			'ma checkbox': 'oui',
		})

		const result = getEvaluatedFormElement(
			engine,
			'ma checkbox',
		) as EvaluatedCheckbox & {
			applicable: true
		}

		expect(result.applicable).toBe(true)
		expect(result.checked).toBe(undefined)
		expect(result.defaultChecked).toBe(true)
	})

	it('should evaluate radio group', () => {
		const engine = new Engine(
			{
				'mon choix': {
					'une possibilité': ["'opt1'", "'opt2'"],
				},
			},
			{ flag: { filterNotApplicablePossibilities: true } },
		)

		const result = getEvaluatedFormElement(
			engine,
			'mon choix',
		) as EvaluatedRadioGroup
		expect(result.applicable).toBe(true)
		expect(result.value).toBe(undefined)
		expect(result.defaultValue).toBe(undefined)
		const options = result.options

		expect(options).toHaveLength(2)
	})

	it('should evaluate yes/no', () => {
		const engine = new Engine(
			{
				'question yes no': {
					question: 'BLA ?',
				},
			},
			{ flag: { filterNotApplicablePossibilities: true } },
		)

		const result = getEvaluatedFormElement(
			engine,
			'question yes no',
		) as EvaluatedRadioGroup

		expect(result.applicable).toBe(true)
		expect(result.options).toHaveLength(2)
	})

	it('should handle default values and situation override', () => {
		const engine = new Engine(
			{
				'mon choix': {
					'par défaut': 12,
					'une possibilité': [12, 42],
				},
			},
			{
				flag: {
					filterNotApplicablePossibilities: true,
				},
			},
		)
		engine.setSituation({
			'mon choix': 42,
		})

		const result = getEvaluatedFormElement(
			engine,
			'mon choix',
		) as EvaluatedRadioGroup
		expect(result.applicable).toBe(true)
		expect(result.value).toEqual(42)
		expect(result.defaultValue).toEqual(12)
	})

	it('should handle non applicable options', () => {
		const engine = new Engine(
			{
				'mon choix': {
					valeur: "'opt2'",
					'une possibilité': [
						{
							opt1: {
								'applicable si': 'non',
							},
						},
						{ opt2: {} },
						{ opt3: {} },
					],
				},
			},
			{ flag: { filterNotApplicablePossibilities: true } },
		)

		const result = getEvaluatedFormElement(
			engine,
			'mon choix',
		) as EvaluatedRadioGroup
		expect(result.applicable).toBe(true)
		const options = result.options
		expect(options).toHaveLength(2)
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

		const result = getEvaluatedFormElement(
			engine,
			'mon texte',
		) as EvaluatedTextarea & {
			applicable: true
		}
		expect(result.applicable).toBe(true)
		expect(result.value).toEqual('Un texte long')
		expect(result.defaultValue).toEqual('Un long texte')
	})

	it('should evaluate number with unit', () => {
		const engine = new Engine({
			'ma valeur': {
				unité: '€',
			},
		})

		const result = getEvaluatedFormElement(
			engine,
			'ma valeur',
		) as EvaluatedNumberInput
		expect(result.value).toEqual(undefined)
		expect(result.unit).toEqual('€')
	})

	it('should add a required to true if the value is missing', () => {
		const engine = new Engine({
			'mon texte': {
				type: 'texte',
			},
		})

		const result = getEvaluatedFormElement(
			engine,
			'mon texte',
		) as EvaluatedTextarea & {
			applicable: true
		}
		expect(result.required).toBe(true)
	})
	it('should not add a required to true if the value is missing but the default value is defined', () => {
		const engine = new Engine({
			'mon texte': {
				'par défaut': "'Un long texte'",
			},
		})

		const result = getEvaluatedFormElement(
			engine,
			'mon texte',
		) as EvaluatedTextarea & {
			applicable: true
		}
		expect(result.required).toBe(false)
	})
})
