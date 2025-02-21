import type Engine from 'publicodes'
import { serializeUnit } from 'publicodes'
import {
	getFormElement,
	getOptionList,
	InputElement,
	RadioGroupElement,
	SelectElement,
	TextareaElement,
} from './formElement'

interface Evaluated {
	applicable: boolean
	required: boolean
	answered: boolean
}

export interface EvaluatedCheckbox extends InputElement<'checkbox'>, Evaluated {
	checked: boolean | undefined
	defaultChecked: boolean | undefined
}

export interface EvaluatedStringInput
	extends InputElement<'date' | 'month' | 'text'>,
		Evaluated {
	value: string | undefined
	defaultValue: string | undefined
}

export interface EvaluatedNumberInput
	extends InputElement<'number'>,
		Evaluated {
	value: number | undefined
	unit: string | undefined
	defaultValue: number | undefined
}

export interface EvaluatedRadioGroup extends RadioGroupElement, Evaluated {
	value: string | undefined
	defaultValue: string | undefined
}

export interface EvaluatedSelect extends SelectElement, Evaluated {
	value: string | undefined
	defaultValue: string | undefined
}

export interface EvaluatedTextarea extends TextareaElement, Evaluated {
	value: string | undefined
	defaultValue: string | undefined
}

/**
 * Represents the different types of form elements that can be generated from Publicodes rules.
 *
 * Each evaluated form element includes common properties:
 * - `applicable`: Whether the field should be shown based on applicability rules
 * - `required`: Whether user input is required for this field
 * - `answered`: Whether the field has been answered/filled
 * - `value`: The current value of the field (in the situation)
 * - `defaultValue`: The default value of the field if not answered
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
 * @see {@link getEvaluatedFormElement} - Function to retrieve evaluated form elements
 * @see {@link FormElement} - Type definition for form elements
 */
export type EvaluatedFormElement =
	| EvaluatedCheckbox
	| EvaluatedStringInput
	| EvaluatedNumberInput
	| EvaluatedRadioGroup
	| EvaluatedSelect
	| EvaluatedTextarea

/**
 * Get the form element for a publicodes rules enriched with runtime information from the engine.
 *
 *
 * The evaluated form element includes additional properties:
 * - applicable: whether the element should be displayed
 * - required: whether the element is mandatory
 * - answered: whether the element has a value in the current situation
 * - value/checked: the current value of the element
 * - defaultValue/defaultChecked: the default value of the element
 * - unit: for number inputs, the unit of measurement
 * - options: for radio groups and select elements, the list of options with applicability
 *
 * see {@link EvaluatedFormElement}
 *
 * @param engine - The publicodes engine instance
 * @param dottedName - The dotted name identifier of the rule to evaluate
 * @returns The evaluated form element with additional runtime properties
 *
 * @throws {Error} Implicitly throws if the engine operations fail
 *
 * @template Name - The type of the dotted name string
 */
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

	const possibilities = engine.getPossibilitiesFor(element.id as Name, {
		filterNotApplicable: true,
	})!
	element.options = getOptionList(engine, possibilities)

	return element
}
