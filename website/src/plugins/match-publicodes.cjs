const escapeBackticks = (text) => text.replace(/`/g, '\\`')

const plugin = (options) => {
	let alreadyImported = false
	let transformed = false
	const transformer = async (root) => {
		const { visit } = await import('unist-util-visit')
		visit(root, [{ type: 'code', lang: 'publicodes' }], (node) => {
			const value = escapeBackticks(node.value)
			transformed = true
			node.type = 'mdxJsxFlowElement'
			node.name = 'PublicodesExample'
			node.attributes = [
				createAttribute('rules', value),
				node.meta && createAttribute('meta', node.meta),
			].filter((attr) => Boolean(attr))
			node.children = []
		})
		if (transformed && !alreadyImported) {
			root.children.unshift(createImportNode())
		}
	}
	return transformer
}

module.exports = plugin

function createAttribute(attributeName, attributeValue) {
	return {
		type: 'mdxJsxAttribute',
		name: attributeName,
		value: attributeValue,
	}
}

function createImportNode() {
	return {
		type: 'mdxjsEsm',
		value:
			"import PublicodesExample from '@site/src/components/PublicodesExample'",
		data: {
			estree: {
				type: 'Program',
				body: [
					{
						type: 'ImportDeclaration',
						specifiers: [
							{
								type: 'ImportDefaultSpecifier',
								local: { type: 'Identifier', name: 'PublicodesExample' },
							},
						],
						source: {
							type: 'Literal',
							value: '@site/src/components/PublicodesExample',
							raw: "'@site/src/components/PublicodesExample'",
						},
					},
				],
				sourceType: 'module',
			},
		},
	}
}
