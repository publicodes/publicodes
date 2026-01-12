import type Engine from 'publicodes'
import { formatValue, Possibility, PublicodesError } from 'publicodes'
import {
	inferTypeFromRawFormMeta,
	RuleWithFormMeta,
} from '../utils/rulesWithFormMeta'

export type Option = {
	value: string | number | boolean
	label: string
	description?: string
}

interface FormMeta<Name extends string = string> {
	label: string
	description: string | undefined
	id: Name
}

/**
 * All supported HTML input types for form elements.
 */
export type InputType =
	| 'date'
	| 'month'
	| 'checkbox'
	// | 'email'
	| 'number'
	// | 'range'
	// | 'tel'
	| 'text'

export interface InputElement<Name extends string, Type extends InputType>
	extends FormMeta<Name> {
	element: 'input'
	type: Type
}

export interface SelectElement<Name extends string> extends FormMeta<Name> {
	element: 'select'
	options: Array<Option>
}

export interface RadioGroupElement<Name extends string> extends FormMeta<Name> {
	element: 'RadioGroup'
	style: 'button' | 'card' | 'default'
	orientation: 'horizontal' | 'vertical'
	options: Array<Option>
}

export interface TextareaElement<Name extends string> extends FormMeta<Name> {
	element: 'textarea'
}

export type FormElementOptions = {
	selectTreshold?: number
}

/**
 * Represents the different types of form elements that can be generated from Publicodes rules.
 * This union type combines all possible form control representations.
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
export type FormElement<Name extends string = string> =
	| InputElement<Name, InputType>
	| SelectElement<Name>
	| RadioGroupElement<Name>
	| TextareaElement<Name>

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
	options: FormElementOptions = {},
): FormElement<Name> {
	const selectTreshold = options.selectTreshold ?? 5

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

	const inferredTypeFromMeta = inferTypeFromRawFormMeta(rawRule)
	const effectiveType = inferredTypeFromMeta ?? typeInfo.type
	let saisie = rawRule.form?.saisie

	const inputDetails = {
		label: rawRule.form?.label ?? rawRule.question ?? rule.title,
		description: rawRule.form?.description ?? rawRule.description,
		id: dottedName,
	}

	if (effectiveType === 'boolean') {
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

	if (effectiveType === 'date') {
		return {
			...inputDetails,
			element: 'input',
			type: saisie === 'mois' ? 'month' : 'date',
		}
	}

	const possibilities = engine.getPossibilitiesFor(rule.dottedName)
	if (possibilities) {
		const options = getOptionList(engine, possibilities)

		if (!saisie) {
			if (options.length > selectTreshold) {
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

		const orientation =
			(
				(rawRule.form &&
					'orientation' in rawRule.form &&
					rawRule.form.orientation) ||
				(options.length > 2 && saisie !== 'cartes')
			) ?
				'vertical'
			:	'horizontal'

		return {
			...inputDetails,
			element: 'RadioGroup',
			style:
				saisie === 'cartes' ? 'card'
				: saisie === 'boutons radio' ? 'button'
				: 'default',
			orientation,
			options,
		}
	}

	if (effectiveType === 'string') {
		if (saisie === 'texte long') {
			return { ...inputDetails, element: 'textarea' }
		}
		return { ...inputDetails, element: 'input', type: 'text' }
	}

	if (effectiveType === 'number') {
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
		const choiceRawRule = choiceRule.rawNode as RuleWithFormMeta
		return {
			value: choice.nodeValue,
			label: choiceRawRule.form?.label ?? choiceRule.title,
			description: choiceRawRule.form?.description ?? choiceRawRule.description,
		}
	})
}
