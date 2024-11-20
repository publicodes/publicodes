import { Engine } from './engine'
import { PublicodesError } from './error'

export type RuleInputDetails =
	| {
			type: 'date' | 'nombre' | 'texte' | 'booléen'
	  }
	| {
			type: 'nombre'
			// saisie?: 'curseur' | 'normal' TODO
	  }
	| {
			type: 'booléen'
			saisie?: 'case à cocher' | 'oui/non' // | 'interrupteur'
	  }
	| {
			'choix possible': unknown[]
			saisie?:
				| 'menu déroulant'
				| 'bouton radio'
				| 'carte'
				| {
						element: 'bouton radio' | 'carte'
						orientation: 'horizontal' | 'vertical'
				  }
	  }
	| {
			type: 'texte'
			saisie?: 'texte court' | 'texte long' // | 'email' | 'url' | 'téléphone'
	  }
	| {
			type: 'date'
			saisie?: 'année' | 'mois' | 'date'
	  }

export type InputDetails =
	| {
			element: 'input'
			type: // | 'month'
			| 'checkbox'
				| 'date'
				// | 'email'
				| 'number'
				// | 'range'
				// | 'tel'
				| 'text'
			// | 'url'
	  }
	| {
			element: 'select'
			options: { value: string; label: string }[]
	  }
	| {
			element: 'radioGroup'
			style: 'button' | 'card' | 'default'
			orientation: 'horizontal' | 'vertical'
			options: { value: string | boolean; label: string }[]
	  }
	| {
			element: 'textarea'
	  }

export function inputDetails<Name extends string>(
	engine: Engine<Name>,
	dottedName: Name,
): InputDetails | null {
	const rule = engine.getRule(dottedName)
	const typeInfo = engine.context.nodesTypes.get(rule)
	if (!typeInfo?.type) {
		return null
	}
	if (typeInfo.type === 'boolean') {
		if (rule.rawNode.saisie === 'oui/non' || rule.rawNode.question) {
			return {
				element: 'radioGroup',
				orientation: 'horizontal',
				style: 'button',
				options: [
					{ value: true, label: 'Oui' },
					{ value: false, label: 'Non' },
				],
			}
		} else {
			return { element: 'input', type: 'checkbox' }
		}
	}

	if (typeInfo?.type === 'string') {
		if (rule.rawNode.saisie === 'texte long') {
			return { element: 'textarea' }
		}
		return { element: 'input', type: 'text' }
	}

	if (typeInfo?.type === 'number') {
		return { element: 'input', type: 'number' }
	}

	if (typeInfo?.type === 'date') {
		return { element: 'input', type: 'date' }
	}

	throw new PublicodesError('InternalError', 'Type de donnée non géré', {
		dottedName,
	})
}
