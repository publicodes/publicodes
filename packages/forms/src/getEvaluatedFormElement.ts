import type Engine from 'publicodes'
import { serializeUnit } from 'publicodes'
import {
	getFormElement,
	InputElement,
	Option,
	RadioGroupElement,
	SelectElement,
	TextareaElement,
} from './formElement'

type Evaluated<T> = T & {
	applicable: boolean
	required: boolean
	answered: boolean
}

export type EvaluatedOption = Option & {
	applicable: boolean
}
export type EvaluatedCheckbox = InputElement<'checkbox'> &
	Evaluated<{
		checked: boolean | undefined
		defaultChecked: boolean | undefined
	}>

export type EvaluatedStringInput = InputElement<'date' | 'month' | 'text'> &
	Evaluated<{
		value: string | undefined
		defaultValue: string | undefined
	}>

export type EvaluatedNumberInput = InputElement<'number'> &
	Evaluated<{
		value: number | undefined
		unit: string | undefined
		minValue: number | undefined
		defaultValue: number | undefined
	}>

export type EvaluatedOptionsGroup = (
	| Omit<RadioGroupElement, 'options'>
	| Omit<SelectElement, 'options'>
) & {
	required: boolean
	answered: boolean
	value: string | undefined

	defaultValue: string | undefined
} & (
		| {
				applicable: true
				options: Array<EvaluatedOption>
		  }
		| {
				applicable: false
				options: Array<Option>
		  }
	)

export type EvaluatedTextarea = TextareaElement &
	Evaluated<{
		value: string | undefined
		defaultValue: string | undefined
	}>

/**
 * Get the form element for a publicodes rule with additional evaluated properties.
 *
 * These properties are computed at runtime based on the current state of the Publicodes engine.
 *
 * Each evaluated form element includes common properties:
 * - `applicable`: Whether the field should be shown based on applicability rules
 * - `required`: Whether user input is required for this field
 * - `answered`: Whether the field has been answered/filled
 *
 * Can be one of:
 * - `EvaluatedCheckbox`: A checkbox with checked state
 * - `EvaluatedStringInput`: Text/date input with current value
 * - `EvaluatedNumberInput`: Number input with value and unit
 * - `EvaluatedOptionsGroup`: Select/radio with applicable options
 * - `EvaluatedTextarea`: Multiline text with current value
 *
 * @example
 * ```ts
 * // Example of an evaluated number input
 * const evaluatedField: EvaluatedFormElement = {
 *   element: 'input',
 *   type: 'number',
 *   id: 'salary',
 *   label: 'Monthly salary',
 *   applicable: true,
 *   required: true,
 *   answered: false,
 *   value: 3000,
 *   unit: '€',
 *   defaultValue: 2500
 * }
 * ```
 *
 * @see {@link addEvaluatedProperties} - Function that computes these evaluated properties
 */
export type EvaluatedFormElement =
	| EvaluatedCheckbox
	| EvaluatedStringInput
	| EvaluatedNumberInput
	| EvaluatedOptionsGroup
	| EvaluatedTextarea

export function getEvaluatedFormElement<Name extends string>(
	engine: Engine<Name>,
	dottedName: Name,
): EvaluatedFormElement {
	const element = getFormElement(engine, dottedName) as EvaluatedFormElement

	element.applicable =
		engine.evaluate({
			'est applicable': dottedName,
		}).nodeValue === true

	if (element.applicable === false) {
		return element
	}

	const defaultValue = engine.evaluate({
		valeur: dottedName,
		contexte: {
			[dottedName]: {
				nodeKind: 'constant',
				nodeValue: undefined,
			},
		},
	})

	element.required =
		dottedName in defaultValue.missingVariables &&
		defaultValue.nodeValue === undefined

	const situation = engine.getSituation()
	element.answered = element.id in situation

	const value =
		dottedName in situation ?
			engine.evaluate(situation[dottedName]!).nodeValue
		:	undefined

	if (element.element === 'input' && element.type === 'checkbox') {
		element.checked = value as boolean | undefined
		element.defaultChecked = defaultValue.nodeValue as boolean | undefined
		return element
	}

	element.value = value as string | number | undefined
	element.defaultValue = defaultValue.nodeValue as string | number | undefined

	if (element.element === 'input' && element.type === 'number') {
		element.unit = defaultValue?.unit && serializeUnit(defaultValue?.unit)
	}

	if (!('options' in element)) {
		return element
	}

	const applicableList = engine
		.getPossibilitiesFor(dottedName)
		?.map(
			(possibility) =>
				engine.evaluate(possibility.notApplicable).nodeValue !== true,
		)

	element.options.forEach((option, i) => {
		option.applicable = applicableList?.[i] ?? true
	})

	return element
}
