import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import { displayName } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { RuleLink } from './RuleLink'

export function RuleNavigation({
	ast,
	current,
}: {
	ast: PublicodeAST
	current: string
}): ReactElement {
	const parent = current.split(' . ').slice(0, -1).join(' . ')
	const siblings = Object.keys(ast).filter(
		(name) => name.split(' . ').slice(0, -1).join(' . ') === parent,
	)
	return (
		<nav className="publicodes-rule-navigation">
			<ul>
				{siblings.map((name) => (
					<li key={name} aria-current={name === current ? 'page' : undefined}>
						<RuleLink address={name}>{displayName(ast, name)}</RuleLink>
					</li>
				))}
			</ul>
		</nav>
	)
}
