import type Engine from 'publicodes'
import {
	FormElement,
	InputElement,
	Option,
	RadioGroupElement,
	SelectElement,
	TextareaElement,
} from './formElement'

type WithValue<T> =
	| (T & {
			isApplicable: true
	  })
	| {
			isApplicable: false
	  }
export type OptionWithValue = Option & {
	isApplicable: boolean
}
export type CheckboxWithValue = InputElement<'checkbox'> &
	WithValue<{
		checked: boolean | undefined
		defaultChecked: boolean | undefined
	}>

export type StringInputWithValue = InputElement<'date' | 'month' | 'text'> &
	WithValue<{
		value: string | undefined
		defaultValue: string | undefined
	}>

export type NumberInputWithValue = InputElement<'number'> &
	WithValue<{
		value: number | undefined
		defaultValue: number | undefined
	}>

export type OptionsGroupWithValue = (
	| Omit<RadioGroupElement, 'options'>
	| Omit<SelectElement, 'options'>
) &
	(
		| {
				isApplicable: true
				value: string | undefined
				defaultValue: string | undefined
				options: Array<OptionWithValue>
		  }
		| { isApplicable: false; options: Array<Option> }
	)

export type TextareaWithValue = TextareaElement &
	WithValue<{
		value: string | undefined
		defaultValue: string | undefined
	}>

export type FormElementWithValue =
	| CheckboxWithValue
	| StringInputWithValue
	| NumberInputWithValue
	| OptionsGroupWithValue
	| TextareaWithValue

export function evaluateFormElement(
	engine: Engine,
	formElement: FormElement,
): FormElementWithValue {
	const element: FormElementWithValue = formElement as FormElementWithValue
	const dottedName = element.id

	element.isApplicable =
		engine.evaluate({
			'est applicable': dottedName,
		}).nodeValue === true

	if (element.isApplicable === false) {
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
	}).nodeValue

	const value =
		dottedName in engine.getSituation() ?
			engine.evaluate(dottedName).nodeValue
		:	undefined

	if (element.element === 'input' && element.type === 'checkbox') {
		element.checked = value as boolean | undefined
		element.defaultChecked = defaultValue as boolean | undefined
		return element
	}

	element.value = value as string | number | undefined
	element.defaultValue = defaultValue as string | number | undefined
	if (!('options' in element)) {
		return element
	}
	const rules = engine.getParsedRules()
	element.options.forEach((option) => {
		if (typeof option.value !== 'string') {
			option.isApplicable = true
			return
		}
		const optionValue = option.value.slice(1, -1) // remove quotes
		const optionDottedName = `${dottedName} . ${optionValue}`
		if (!(optionDottedName in rules)) {
			option.isApplicable = true
			return
		}

		option.isApplicable =
			engine.evaluate({
				'est applicable': optionDottedName,
			}).nodeValue === true
	})
	return element
}
