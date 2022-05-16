export const catchError = <T>(fn: () => T): [null, T] | [Error] => {
	try {
		return [null, fn()]
	} catch (error) {
		if (error instanceof Error) {
			console.error(error, error.name, error.message)
			return [error]
		}
		throw error
	}
}

export const PickInObject = <
	T extends Record<string, unknown>,
	U extends (keyof T)[]
>(
	object: T,
	keys: U
): Pick<T, U[number]> => {
	return keys.reduce(
		(newObj, key) => ({ ...newObj, [key]: object[key] }),
		{} as Pick<T, U[number]>
	)
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: unknown): item is Record<string, unknown> {
	return !!item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(
	target: Record<string, unknown>,
	...sources: Record<string, unknown>[]
): Record<string, unknown> {
	if (!sources.length) {
		return target
	}
	const source = sources.shift()

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) {
					Object.assign(target, { [key]: {} })
				}
				mergeDeep(
					target[key] as Record<string, unknown>,
					source[key] as Record<string, unknown>
				)
			} else {
				Object.assign(target, { [key]: source[key] })
			}
		}
	}

	return mergeDeep(target, ...sources)
}
