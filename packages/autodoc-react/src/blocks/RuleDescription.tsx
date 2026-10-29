import type { ReactElement } from 'react'
import { paragraphs } from './prose'

export function RuleDescription({
	description,
}: {
	/** The author's markdown, or null when they wrote none. */
	description: string | null
}): ReactElement | null {
	if (!description) return null
	return (
		<div className="publicodes-rule-description">{paragraphs(description)}</div>
	)
}
