import { PARAMETER_NOTES } from '@publicodes/autodoc-core'
import type { ParameterState, ValueView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'

/**
 * A value with its unit, or the name of its absence. Never both. The label and the
 * figure are separate elements: the marks of a figure (the dotted line of a
 * parameter) must not reach the word that qualifies it. The figure is also where a
 * parameter explains itself — with the sentence the projection gives it, so the
 * fiche and the tooltip say the same thing.
 */
export function Value({
	value,
	parameter = null,
	note = null,
}: {
	value: ValueView
	parameter?: ParameterState | null
	note?: string | null
}): ReactElement | null {
	if (value.state === 'absent') return null
	// the projection gives the sentence; used on its own, the value reads it from
	// the same table rather than keeping a copy of the words
	const title =
		note ?? (parameter !== null ? PARAMETER_NOTES[parameter] : null) ?? undefined
	if (value.state === 'value')
		return (
			<span className="publicodes-value" data-parameter={parameter ?? undefined}>
				{parameter === 'par défaut' && (
					<>
						<span className="publicodes-value__label">par défaut</span>{' '}
					</>
				)}
				<span className="publicodes-value__figure" title={title}>
					{value.text}
				</span>
			</span>
		)
	return (
		<span className="publicodes-absence" title={title}>
			{value.text}
		</span>
	)
}
