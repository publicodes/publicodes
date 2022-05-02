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
