/* Those are postprocessor functions for the Nearley grammar.ne.
The advantage of putting them here is to get prettier's JS formatting, since Nealrey doesn't support it https://github.com/kach/nearley/issues/310 */
import { normalizeDateString } from './date.ts'

export const binaryOperation = ([A, , operator, , B]) => ({
	[operator.value.toLowerCase()]: [A, B],
})

export const unaryOperation = ([operator, , A]) => ({
	[operator]: [number([{ value: '0' }]), A],
})

export const variable = (arg) => {
	return {
		variable: arg.value,
	}
}

export const JSONObject = ([{ value }]) => {
	value
	// TODO
}
export const number = ([{ value }]) => ({
	constant: {
		type: 'number',
		nodeValue: parseFloat(value),
	},
})

export const numberWithUnit = (value) => ({
	...number(value),
	unité: value[2].value,
})

export const date = ([{ value }]) => {
	return {
		constant: {
			type: 'date',
			nodeValue: normalizeDateString(value),
		},
	}
}

export const boolean = ([{ value }]) => ({
	constant: {
		type: 'boolean',
		nodeValue: value === 'oui',
	},
})

export const string = ([{ value }]) => ({
	constant: {
		type: 'string',
		nodeValue: value.slice(1, -1),
	},
})
