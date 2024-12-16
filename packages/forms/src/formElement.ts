import type Engine from 'publicodes'
import { formatValue, PublicodesError } from 'publicodes'
import { RuleWithFormMeta } from '.'

export type Option = {
	value: string | number | boolean
	label: string
	description?: string
}

type FormMeta = {
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

export type InputElement<Type extends InputType> = FormMeta & {
	element: 'input'
	type: Type
}

export type SelectElement = FormMeta & {
	element: 'select'
	options: Array<Option>
}

export type RadioGroupElement = FormMeta & {
	element: 'RadioGroup'
	style: 'button' | 'card' | 'default'
	orientation: 'horizontal' | 'vertical'
	options: Array<Option>
}

export type TextareaElement = FormMeta & {
	element: 'textarea'
}

export type FormElement =
	| InputElement<InputType>
	| SelectElement
	| RadioGroupElement
	| TextareaElement

/** @alpha */

export function getFormElement<Name extends string>(
	engine: Engine<Name>,
	dottedName: Name,
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

	if (rule.possibilities) {
		const choices = rule.possibilities.explanation.map((choice): Option => {
			if (choice.nodeKind === 'constant') {
				return {
					value: choice.nodeValue as string | number,
					label: formatValue(choice) as string,
				}
			}
			if (choice.nodeKind === 'reference') {
				const choiceRule = engine.getRule(choice.dottedName as Name)
				return {
					value: choice.name,
					label: choiceRule.title,
					description: choiceRule.rawNode.description,
				}
			}
			throw new PublicodesError('InternalError', 'Type de donnée non géré', {
				dottedName,
			})
		})

		if (!saisie) {
			if (choices.length > 5) {
				saisie = 'menu déroulant'
			} else {
				saisie = 'boutons radio'
			}
		}
		if (saisie === 'menu déroulant') {
			return {
				...inputDetails,
				element: 'select',
				options: choices,
			}
		}
		const style = typeof saisie === 'string' ? saisie : saisie.style

		const orientation =
			typeof saisie === 'string' ?
				choices.length > 2 && saisie !== 'cartes' ?
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
			options: choices,
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
