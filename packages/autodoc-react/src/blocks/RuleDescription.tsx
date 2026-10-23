import type { RuleView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { paragraphs } from './prose'

export function RuleDescription({ view }: { view: RuleView }): ReactElement | null {
	if (!view.description) return null
	return (
		<div className="publicodes-rule-description">{paragraphs(view.description)}</div>
	)
}
