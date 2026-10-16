import type { RuleView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { RuleLink } from './RuleLink'

/** Where the reader stands among the rules written beside this one. */
export function RuleNavigation({ view }: { view: RuleView }): ReactElement {
	return (
		<nav className="publicodes-rule-navigation">
			<ul>
				{view.siblings.map((sibling) => (
					<li
						key={sibling.address}
						aria-current={sibling.address === view.address ? 'page' : undefined}
					>
						<RuleLink address={sibling.address}>{sibling.name}</RuleLink>
					</li>
				))}
			</ul>
		</nav>
	)
}
