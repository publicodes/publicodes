export type PageOptions = {
	minFields: number
	maxFields: number
}

/**
 * Creates a function that splits an array of fields into pages based on their namespaces.
 * The pages are created by first splitting fields into namespace groups that respect maxFields,
 * then combining small groups to respect minFields when possible.
 *
 * @param options - Configuration options for page splitting
 * @param options.minFields - Minimum number of fields per page (default: 3)
 * @param options.maxFields - Maximum number of fields per page (default: 6)
 *
 * @returns A function that takes an array of field names and returns an array of pages,
 * where each page is an array of field names
 *
 * @example
 * ```ts
 * const pageSplitter = splitByNamespace({ minFields: 3, maxFields: 6 })
 * const pages = pageSplitter(['foo . a', 'foo . b', 'bar . c', 'bar . d'])
 * // Returns: [['foo . a', 'foo . b'], ['bar . c', 'bar . d']]
 * ```
 */
export function splitByNamespace<Name extends string>(
	options: PageOptions = {
		minFields: 3,
		maxFields: 6,
	},
) {
	return (nextFields: Array<Name>): Array<Array<Name>> => {
		let pages = explodeUntilUnderMaxField(options, '', nextFields).map(
			([, fields]) => fields,
		)
		pages = groupUntilOverMinField(options, pages)
		return pages
	}
}

export function groupUntilOverMinField<Name extends string>(
	{ maxFields, minFields }: PageOptions,
	pages: Array<Array<Name>>,
) {
	pages = pages.reduce<Array<Array<Name>>>((pages, fields) => {
		let currentPage = pages.pop() ?? []
		const nextPage = [...currentPage, ...fields]

		if (nextPage.length > maxFields) {
			if (currentPage.length < minFields) {
				// Combine with the previous page if it doesn't lead to a page over maxFields
				const penultimatePage = pages.pop() ?? []
				if (penultimatePage.length + currentPage.length <= maxFields) {
					currentPage = [...penultimatePage, ...currentPage]
				} else {
					pages.push(penultimatePage)
				}
			}
			return [...pages, currentPage, fields]
		}
		if (nextPage.length < minFields) {
			return [...pages, nextPage]
		}
		return [...pages, nextPage, []]
	}, [])

	const lastPage = pages.pop()
	if (!lastPage?.length) {
		return pages
	}
	return [...pages, lastPage]
}

export function explodeUntilUnderMaxField<Name extends string>(
	options: PageOptions,
	namespace = '',
	fields: Array<Name>,
): Array<[namespace: string, fields: Array<Name>]> {
	if (fields.length <= options.maxFields) {
		return [[namespace, fields]]
	}
	return (
		Object.entries(
			Object.groupBy(fields, (dottedName) => {
				const name = dottedName.split(' . ')
				if (namespace === '') {
					return name[0]
				}
				return [namespace, name[namespace.split(' . ').length]].join(' . ')
			}),
		) as Array<[Name, Array<Name>]>
	).flatMap(([namespace, fields]) =>
		explodeUntilUnderMaxField(options, namespace, fields),
	)
}
