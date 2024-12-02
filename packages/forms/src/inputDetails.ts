import Engine, { formatValue, PublicodesError, Situation } from 'publicodes'

export type RuleInputDetails = {
	type: 'date' | 'nombre' | 'texte' | 'booléen'
} & (
	| {
			type: 'booléen'
			saisie?: 'case à cocher' | 'oui/non' // | 'interrupteur'
	  }
	| {
			'une possibilité': unknown
			saisie?:
				| 'menu déroulant'
				| 'boutons radio'
				| 'cartes'
				| {
						style?: 'boutons radio' | 'cartes' | 'défaut'
						orientation: 'horizontal' | 'vertical'
				  }
	  }
	| {
			type: 'texte'
			saisie?: 'texte court' | 'texte long' // | 'email' | 'url' | 'téléphone'
	  }
	| {
			type: 'date'
			saisie?: 'année' | 'mois'
	  }
)

type Options = Array<{
	value: string | boolean | number
	label: string
	description?: string
	publicodesValue: string
}>

export type InputDetails = {
	label: string
	description: string | undefined
	placeholder: string | undefined
	id: string
	value: string | number | boolean | undefined | null
} & (
	| {
			element: 'input'
			type:
				| 'date'
				| 'month'
				| 'checkbox'
				// | 'email'
				| 'number'
				// | 'range'
				// | 'tel'
				| 'text'
			// | 'url'
	  }
	| {
			element: 'select'
			options: Options
	  }
	| {
			element: 'RadioGroup'
			style: 'button' | 'card' | 'default'
			orientation: 'horizontal' | 'vertical'
			options: Options
	  }
	| {
			element: 'textarea'
	  }
)

/** @alpha */
// TODO : should this be independant of situation ? This would be more efficient...
export function inputDetails<Name extends string>(
	engine: Engine<Name>,
	dottedName: Name,
): InputDetails | null {
	const rule = engine.getRule(dottedName)

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
	const defaultValue = engine.evaluate({
		valeur: dottedName,
		contexte: {
			[dottedName]: {
				nodeKind: 'constant',
				nodeValue: undefined,
			},
		},
	}).nodeValue

	let saisie = rule.rawNode.saisie
	const situationValue = engine.getSituation()[dottedName]
	const inputDetails = {
		label: rule.rawNode.question || rule.title,
		description: rule.rawNode.description,
		placeholder:
			defaultValue != undefined ? defaultValue.toString() : undefined,
		id: dottedName,
		value: situationValue && engine.evaluate(situationValue).nodeValue,
	}

	if (typeInfo.type === 'boolean') {
		if (saisie === 'oui/non' || rule.rawNode.question) {
			return {
				...inputDetails,
				element: 'RadioGroup',
				orientation: 'horizontal',
				style: 'button',
				options: [
					{ value: true, label: 'Oui', publicodesValue: 'oui' },
					{ value: false, label: 'Non', publicodesValue: 'non' },
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

	if (rule.possibleChoices) {
		const choices = rule.possibleChoices.map((choice) => {
			if (choice.nodeKind === 'constant') {
				return {
					value: choice.nodeValue as string | number,
					label: formatValue(choice),
					publicodesValue: choice.rawNode as string,
				}
			}
			if (choice.nodeKind === 'reference') {
				const choiceRule = engine.getRule(choice.dottedName as Name)
				return {
					value: choice.name,
					label: choiceRule.title,
					description: choiceRule.rawNode.description,
					publicodesValue: `'${choice.name}'`,
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

export function setInputValue(
	engine: Engine,
	dottedName: string,
	value: string | number | boolean | undefined,
) {
	const rule = engine.getRule(dottedName)
	const typeInfo = engine.context.nodesTypes.get(rule)
	let situationValue: Situation<string>[string]
	if (value === '' || value === undefined) {
		situationValue = undefined
	} else if (typeof value === 'boolean') {
		situationValue = value ? 'oui' : 'non'
	} else if (typeInfo?.type === 'string') {
		situationValue = `'${value.toString()}'`
	} else if (typeInfo?.type === 'date') {
		situationValue = new Date(value)
			.toISOString()
			.split('T')[0]
			.split('-')
			.reverse()
			.join('/')
	} else {
		situationValue = value
	}
	engine.setSituation(
		{
			[dottedName]: situationValue,
		},
		{ keepPreviousSituation: true },
	)
}

export function getInputRules<Name extends string>(
	engine: Engine<Name>,
	...goals: Array<Name>
): Array<Name> {
	const missings = engine.evaluate({
		somme: [
			...goals,
			// ...rulesInSituation.map((dottedName) => ({
			// 	somme: goals,
			// 	contexte: { [dottedName]: undefinedNode },
			// })),
		],
	}).missingVariables

	return Object.entries(missings)
		.filter(
			([dottedName]) =>
				dottedName in missings &&
				engine.evaluate({ 'est non applicable': dottedName }).nodeValue !==
					true,
		)
		.sort(([_, score1], [__, score2]) => {
			// Sort lexically so that rule with same namespace are contiguous,
			// if (ruleParent(dottedName1) === ruleParent(dottedName2)) {
			return score2 - score1
			// }
			// return dottedName2.localeCompare(dottedName1)
		})
		.map(([dottedName]) => dottedName) as Array<Name>
	// .map((dottedName) => inputDetails(engine, dottedName))
	// .filter(Boolean) as Array<InputDetails>
}
