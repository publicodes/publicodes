import type Engine from 'publicodes'
import { serializeUnit } from 'publicodes'
import {
	FormElement,
	InputElement,
	Option,
	RadioGroupElement,
	SelectElement,
	TextareaElement,
} from './formElement'

type Evaluated<T> =
	| (T & {
			applicable: true
			required: boolean
	  })
	| {
			applicable: false
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
		defaultValue: number | undefined
	}>

export type EvaluatedOptionsGroup = (
	| Omit<RadioGroupElement, 'options'>
	| Omit<SelectElement, 'options'>
) &
	(
		| {
				applicable: true
				required: boolean
				value: string | undefined
				defaultValue: string | undefined
				options: Array<EvaluatedOption>
		  }
		| { applicable: false; options: Array<Option> }
	)

export type EvaluatedTextarea = TextareaElement &
	Evaluated<{
		value: string | undefined
		defaultValue: string | undefined
	}>

export type EvaluatedFormElement =
	| EvaluatedCheckbox
	| EvaluatedStringInput
	| EvaluatedNumberInput
	| EvaluatedOptionsGroup
	| EvaluatedTextarea

export function addEvaluation(
	engine: Engine,
	formElement: FormElement,
): EvaluatedFormElement {
	const element: EvaluatedFormElement = formElement as EvaluatedFormElement
	const dottedName = element.id

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

	const value =
		dottedName in engine.getSituation() ?
			engine.evaluate(dottedName).nodeValue
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
	const rules = engine.getParsedRules()
	element.options.forEach((option) => {
		if (typeof option.value !== 'string') {
			option.applicable = true
			return
		}
		const optionValue = option.value.slice(1, -1) // remove quotes
		const optionDottedName = `${dottedName} . ${optionValue}`
		if (!(optionDottedName in rules)) {
			option.applicable = true
			return
		}

		option.applicable =
			engine.evaluate({
				'est applicable': optionDottedName,
			}).nodeValue === true
	})
	return element
}
