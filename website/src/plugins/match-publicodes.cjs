const escapeBackticks = (text) => text.replace(/`/g, '\\`')

const plugin = (options) => {
	const transformer = async (ast) => {
		const { visit } = await import('unist-util-visit')
		let imported = false

		visit(ast, [{ type: 'code', lang: 'publicodes' }], (node) => {
			if (!imported) {
				imported = true
				ast.children.unshift({
					type: 'import',
					value:
						"import PublicodeExample from '@site/src/components/PublicodeExample.tsx'",
				})
			}

			const value = escapeBackticks(node.value)
			const meta = node.meta ? `meta={\`${escapeBackticks(node.meta)}\`}` : ''

			node.type = 'jsx'
			node.value = `<PublicodeExample rules={\`${value}\`} ${meta} />`
		})
	}
	return transformer
}

module.exports = plugin
