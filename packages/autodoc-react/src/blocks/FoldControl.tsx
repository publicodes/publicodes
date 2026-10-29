import type { FoldView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { useAutodocPage } from '../components/AutodocPageContext'

/**
 * Holds back the terms that had no effect on the value, and says how many. It sits
 * on the line it belongs to, past the row's right edge, in the empty margin: the
 * chevron points down to reveal the terms, up to hide them again.
 */
export function FoldControl({ fold }: { fold: FoldView }): ReactElement {
	const { toggleFold } = useAutodocPage()
	return (
		<button
			type="button"
			className="publicodes-control publicodes-fold"
			aria-expanded={fold.expanded}
			aria-label={fold.label}
			title={fold.label}
			onClick={() => toggleFold(fold.id, !fold.expanded)}
		>
			<svg
				className="publicodes-control__icon"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path d="m7 6 5 5 5-5" />
				<path d="m7 13 5 5 5-5" />
			</svg>
			{!fold.expanded && (
				<span className="publicodes-fold__count">{fold.count}</span>
			)}
		</button>
	)
}
