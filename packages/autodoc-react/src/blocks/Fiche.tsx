import type { RuleView } from '@publicodes/autodoc-core'
import { useRef, useState, type ReactElement, type ReactNode } from 'react'
import { Value } from './Value'
import { firstParagraph } from './prose'

/** The pointer has to rest on the term: a passing hover is not a question. */
const HOVER_DELAY = 500

/**
 * A rule's card, as a hover: what the model says about it, what it is worth,
 * and where it lives. Shown on a delayed hover or immediately on focus, so a
 * keyboard reader gets the same thing without the wait.
 */
export function Fiche({
	view,
	children,
}: {
	view: RuleView
	children: ReactNode
}): ReactElement {
	const [open, setOpen] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

	const clear = (): void => {
		if (timer.current !== undefined) clearTimeout(timer.current)
		timer.current = undefined
	}
	const showAfterHover = (): void => {
		clear()
		timer.current = setTimeout(() => setOpen(true), HOVER_DELAY)
	}
	const showNow = (): void => {
		clear()
		setOpen(true)
	}
	const hide = (): void => {
		clear()
		setOpen(false)
	}

	const value = view.equation?.result

	return (
		<span
			className="publicodes-fiche"
			onMouseEnter={showAfterHover}
			onMouseLeave={hide}
			onFocus={showNow}
			onBlur={hide}
		>
			{children}
			{open && (
				<span
					className="publicodes-fiche__panel"
					role="tooltip"
					onKeyDown={(event) => {
						if (event.key === 'Escape') setOpen(false)
					}}
				>
					{view.description && (
						<span className="publicodes-fiche__doc">
							{firstParagraph(view.description)}
						</span>
					)}
					{value && value.state !== 'absent' && (
						<span className="publicodes-fiche__value">
							<Value value={value} />
						</span>
					)}
					<span className="publicodes-fiche__address">{view.address}</span>
				</span>
			)}
		</span>
	)
}
