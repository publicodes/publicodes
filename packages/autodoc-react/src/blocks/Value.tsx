import type { ValueView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'

/** A value with its unit, or the name of its absence. Never both. */
export function Value({ value }: { value: ValueView }): ReactElement | null {
	if (value.state === 'absent') return null
	if (value.state === 'value')
		return <span className="publicodes-value">{value.text}</span>
	return <span className="publicodes-absence">{value.text}</span>
}
