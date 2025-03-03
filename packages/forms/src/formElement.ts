import type Engine from 'publicodes'
import { formatValue, Possibility, PublicodesError } from 'publicodes'
import { RuleWithFormMeta } from '.'

export type Option = {
	value: string | number | boolean
	label: string
	description?: string
}

interface FormMeta {
	label: string
	description: string | undefined
	id: string
}

type InputType =
	| 'date'
	| 'month'
	| 'checkbox'
	// | 'email'
	| 'number'
	// | 'range'
	// | 'tel'
	| 'text'

export interface InputElement<Type extends InputType> extends FormMeta {
	element: 'input'
	type: Type
}

export interface SelectElement extends FormMeta {
	element: 'select'
	options: Array<Option>
}

export interface RadioGroupElement extends FormMeta {
	element: 'RadioGroup'
	style: 'button' | 'card' | 'default'
	orientation: 'horizontal' | 'vertical'
	options: Array<Option>
}

export interface TextareaElement extends FormMeta {
	element: 'textarea'
}

export type FormElementOptions = {
	selectTreshold?: number
}
/**
 * Represents the different types of form elements that can be generated from Publicodes rules.
 * This union type combines all possible form control representations.
 *
 * @typedef {Object} FormElement
 *
 * Can be one of:
 * - InputElement: Basic HTML input elements (text, number, date, etc.)
 * - SelectElement: Dropdown menu with predefined options
 * - RadioGroupElement: Group of radio buttons with different styling options
 * - TextareaElement: Multiline text input
 *
 * Each element type includes common form metadata:
 * - label: Display text for the form control
 * - description: Optional help text
 * - id: Unique identifier (usually the rule's dotted name)
 *
 * @example
 * ```ts
 * // Input element for a number
 * const salaryInput: FormElement = {
 *   element: 'input',
 *   type: 'number',
 *   label: 'Salary',
 *   id: 'employee.salary'
 * }
 *
 * // Radio group for a boolean choice
 * const activeInput: FormElement = {
 *   element: 'RadioGroup',
 *   style: 'button',
 *   orientation: 'horizontal',
 *   options: [
 *     { label: 'Yes', value: true },
 *     { label: 'No', value: false }
 *   ],
 *   label: 'Is active?',
 *   id: 'employee.active'
 * }
 * ```
 *
 * @see {@link getFormElement}
 */

export type FormElement =
	| InputElement<InputType>
	| SelectElement
	| RadioGroupElement
	| TextareaElement

/**
 * Generates a UI form element representation based on a Publicodes rule.
 *
 * This function analyzes a rule's metadata and type to determine the most appropriate HTML
 * form control for modifying the rule value.
 *
 * The output describes a form element in a framework-agnostic way, making it suitable for use
 * in various UI frameworks (React, Vue, Svelte, etc.) or in plain JS to render actual HTML form controls.
 *
 * @param engine - The Publicodes engine instance
 * @param dottedName - The dotted name identifier of the rule to convert into a form element
 *
 * @returns A FormElement object describing the UI control properties:
 * - For boolean rules: checkbox or radio buttons (oui/non)
 * - For dates: date or month input
 * - For enumerated values: select dropdown or radio group based on number of options
 * - For strings: text input or textarea
 * - For numbers: number input
 *
 * @throws {PublicodesError}
 * - If type information is missing for the rule
 * - If the rule's data type is not supported
 *
 * @example
 * ```ts
 * const element = getFormElement(engine, "employee . salary")
 * // Returns: { element: "input", type: "number", label: "Salary", ... }
 * ```
 */
export function getFormElement<Name extends string>(
	engine: Engine<Name>,
	dottedName: Name,
	formOptions?: FormElementOptions,
): FormElement {
	const rule = engine.getRule(dottedName)
	const rawRule = rule.rawNode as RuleWithFormMeta
	const typeInfo = engine.context.nodesTypes.get(rule)
	if (!typeInfo?.type) {
		throw new PublicodesError(
			'InternalError',
			'Il manque des informations sur le type de cette règle',
			{
				dottedName,
			},
		)
	}

	let saisie = rawRule.saisie

	const inputDetails = {
		label: rawRule.question || rule.title,
		description: rawRule.description,
		id: dottedName,
	}

	if (typeInfo.type === 'boolean') {
		if (saisie === 'oui/non' || rawRule.question) {
			return {
				...inputDetails,
				element: 'RadioGroup',
				orientation: 'horizontal',
				style: 'button',
				options: [
					{ label: 'Oui', value: true },
					{ label: 'Non', value: false },
				],
			}
		} else {
			return { ...inputDetails, element: 'input', type: 'checkbox' }
		}
	}

	if (typeInfo.type === 'date') {
		return {
			...inputDetails,
			element: 'input',
			type: saisie === 'mois' ? 'month' : 'date',
		}
	}

	const possibilities = engine.getPossibilitiesFor(rule.dottedName as Name)
	if (possibilities) {
		const options = getOptionList(engine, possibilities)

		if (!saisie) {
			if (options.length > (formOptions?.selectTreshold || 5)) {
				saisie = 'menu déroulant'
			} else {
				saisie = 'boutons radio'
			}
		}
		if (saisie === 'menu déroulant') {
			return {
				...inputDetails,
				element: 'select',
				options,
			}
		}
		const style = typeof saisie === 'string' ? saisie : saisie.style

		const orientation =
			typeof saisie === 'string' ?
				options.length > 2 && saisie !== 'cartes' ?
					'vertical'
				:	'horizontal'
			:	saisie.orientation

		return {
			...inputDetails,
			element: 'RadioGroup',
			style:
				style === 'cartes' ? 'card'
				: style === 'boutons radio' ? 'button'
				: 'default',
			orientation,
			options,
		}
	}

	if (typeInfo?.type === 'string') {
		if (saisie === 'texte long') {
			return { ...inputDetails, element: 'textarea' }
		}
		return { ...inputDetails, element: 'input', type: 'text' }
	}

	if (typeInfo?.type === 'number') {
		return { ...inputDetails, element: 'input', type: 'number' }
	}

	throw new PublicodesError('InternalError', 'Type de donnée non géré', {
		dottedName,
	})
}

export function getOptionList<Name extends string>(
	engine: Engine<Name>,
	possibilities: Possibility[],
) {
	return possibilities.map((choice: Possibility) => {
		if (choice.type !== 'reference') {
			return {
				value: choice.nodeValue,
				label: formatValue(choice) as string,
			}
		}

		const choiceRule = engine.getRule(choice.dottedName as Name)
		return {
			value: choice.nodeValue,
			label: choiceRule.title,
			description: choiceRule.rawNode.description,
		}
	})
}
