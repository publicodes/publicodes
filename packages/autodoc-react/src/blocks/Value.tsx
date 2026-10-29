import type { ValueView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'

/**
 * A value with its unit, or the name of its absence. Never both. It carries no mark of its
 * own: what a value is — an input, a default, the result of a mechanism — is said by the
 * line it is written on, not by the figure.
 */
export function Value({ value }: { value: ValueView }): ReactElement | null {
	if (value.state === 'absent') return null
	if (value.state === 'value')
		return (
			<span className="publicodes-value">
				<span className="publicodes-value__figure">{value.text}</span>
			</span>
		)
	return <span className="publicodes-absence">{value.text}</span>
}
