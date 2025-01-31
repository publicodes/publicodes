import { utils } from 'publicodes'

/**
 * Groups fields into pages based on their namespace hierarchy, ensuring related fields stay together.
 * Useful when organizing form fields into logical sections or steps.
 *
 * @example
 * ```typescript
 * const fields = [
 *   'company . name',
 *   'personal . first name',
 * 	 'stock . quantity',
 *   'personal . last name'
 *   'company . address',
 * ];
 *
 * const pages = groupByNamespace(fields);
 * // Result:
 * // [
 * //   ['company . name', 'company . address'],
 * //   ['personal . first name', 'personal . last name'],
 * //   ['stock . quantity']
 * // ]
 * ```
 *
 * @param fields - Array of field names with dot-notation namespaces
 * @returns Array of arrays, where each inner array represents a page containing related fields
 */
export function groupByNamespace<Name extends string>(fields: Array<Name>) {
	const pages: Array<Array<Name>> = []
	while (fields.length > 0) {
		const tree = createTree(fields)
		const page = createPage(tree)
		fields = fields.filter((field) => !page.includes(field))
		pages.push(page)
	}
	return pages
}

type Tree<Name extends string> =
	| {
			type: 'node'
			name: Name
			children: Array<Tree<Name>>
	  }
	| {
			type: 'leaf'
			name: Name
	  }

function createPage<Name extends string>(tree: Tree<Name>): Array<Name> {
	if (tree.type === 'leaf') {
		return [tree.name]
	}
	if (tree.children[0].type === 'node') {
		return createPage(tree.children[0])
	}
	return takeWhile((child) => child.type === 'leaf', tree.children).map(
		(child) => child.name,
	)
}

//   TODO : put in publicodes utils
function createTree<Name extends string>(fields: Array<Name>): Tree<Name> {
	return fields.reduce<Tree<Name>>(insertFieldInTree, {
		type: 'node',
		name: '' as Name,
		children: [],
	})
}

function depth(name: string) {
	return name.split(' . ').filter(Boolean).length
}

export function insertFieldInTree<Name extends string>(
	tree: Tree<Name>,
	field: Name,
): Tree<Name> {
	const currentDepth = depth(tree.name)
	const commonAncestor = utils.findCommonAncestor(tree.name, field) as Name
	if (tree.type === 'leaf' || depth(commonAncestor) < currentDepth) {
		return {
			type: 'node',
			name: commonAncestor,
			children: [tree, { type: 'leaf', name: field }],
		}
	}

	const index = tree.children.findIndex((child) => {
		const commonAncestorDepth = depth(
			utils.findCommonAncestor(child.name, field),
		)

		return commonAncestorDepth > currentDepth
	})

	if (index === -1) {
		tree.children.push({ type: 'leaf', name: field })
		return tree
	}

	tree.children[index] = insertFieldInTree(tree.children[index], field)
	return tree
}

function takeWhile<T>(fn: (item: T) => boolean, arr: T[]): T[] {
	const [x, ...xs] = arr

	if (arr.length > 0 && fn(x)) {
		return [x, ...takeWhile(fn, xs)]
	} else {
		return []
	}
}
