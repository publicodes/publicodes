import type { RuleView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'

export function RuleHeader({ view }: { view: RuleView }): ReactElement {
	return (
		<header className="publicodes-rule-header">
			<h1>{view.name}</h1>
			<div className="publicodes-address">{view.address}</div>
			{view.isPublic && <span className="publicodes-public">public</span>}
		</header>
	)
}
