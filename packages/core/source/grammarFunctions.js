/* Those are postprocessor functions for the Nearley grammar.ne.
The advantage of putting them here is to get prettier's JS formatting, since Nealrey doesn't support it https://github.com/kach/nearley/issues/310 */
import { normalizeDateString } from './date.ts'

export const binaryOperation = ([A, , operator, , B]) => ({
	[operator]: [A, B],
})

export const unaryOperation = ([operator, , A]) => ({
	[operator]: [number([{ value: '0' }]), A],
})

export const variable = ([firstFragment, nextFragment], _, reject) => {
	const fragments = [firstFragment, ...nextFragment].map(({ value }) => value)
	if (!nextFragment.length && ['oui', 'non'].includes(firstFragment)) {
		return reject
	}
	return {
		variable: fragments.join(' . '),
	}
}

export const JSONObject = ([{ value }]) => {
	console.log(value)
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

export const boolean = (nodeValue) => () => ({
	constant: {
		type: 'boolean',
		nodeValue,
	},
})

export const string = ([{ value }]) => ({
	constant: {
		type: 'string',
		nodeValue: value.slice(1, -1),
	},
})
