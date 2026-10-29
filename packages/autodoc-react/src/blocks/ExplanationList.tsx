import type { EquationView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import {
	AutodocPageContext,
	useAutodocPage,
} from '../components/AutodocPageContext'
import { Explanation } from './Explanation'

/**
 * A rule's computation as lines. Each row prints what its view says and nothing else: the
 * projection has decided what it reads, what opens it, and what opens under it. The answer
 * a page prints at title scale is not here — it is the page's own line.
 */
export function ExplanationList({
	view,
}: {
	view: EquationView
}): ReactElement {
	const page = useAutodocPage()
	// the lines of the value mechanism end where the chain begins: the last of them carries a
	// plain filet, and the lines under it are what the chain adds rather than its terms
	// une table nomme sa colonne : elle n'a pas de colonne d'opérateur
	const table = view.header !== null
	const firstChained = view.rows.findIndex((row) => row.modifier)
	const lastValue = firstChained > 0 ? firstChained - 1 : -1
	const lines = (
		<>
			{view.rows.map((row, index) => (
				<Explanation
					key={row.id}
					view={row}
					lastValue={index === lastValue && !row.modifier}
					flush={table}
				/>
			))}
		</>
	)
	// a `contexte` mechanism pushes a stack of its own, and its lines are read under it: a
	// navigation from inside them carries that stack to the page it opens
	if (view.contextId === null)
		return <div className="publicodes-equation">{lines}</div>
	return (
		<div className="publicodes-equation">
			<AutodocPageContext.Provider
				value={{ ...page, stack: `${page.stack}-${view.contextId}` }}
			>
				{lines}
			</AutodocPageContext.Provider>
		</div>
	)
}
