import type { ProjectionOptions } from '@publicodes/autodoc-core'
import { openRow, openedWithPage } from '@publicodes/autodoc-core'
import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import { useState } from 'react'

/** Les lignes que le lecteur a ouvertes — les siennes et celles que la page a ouvertes. */
export function useUnfoldedRows({
	ast,
	rule,
	options,
}: {
	ast: PublicodeAST
	rule: string
	/** Ce qu'il faut pour projeter la page : son évaluation, son contexte, ses plis. */
	options: ProjectionOptions
}): {
	expanded: ReadonlySet<string>
	toggleRow: (key: string) => void
} {
	const [expanded, setExpanded] = useState<ReadonlySet<string>>(() =>
		openedWithPage(ast, rule, options),
	)
	// ce que la page a ouvert d'elle-même est un état, pas une vue que le rendu redérive : le
	// lecteur referme ces lignes comme les autres, et les garde fermées
	const [openedFor, setOpenedFor] = useState(rule)
	if (openedFor !== rule) {
		setOpenedFor(rule)
		setExpanded(
			(previous) =>
				new Set([...previous, ...openedWithPage(ast, rule, options)]),
		)
	}
	return {
		expanded,
		toggleRow: (key) =>
			setExpanded((previous) =>
				previous.has(key) ?
					new Set([...previous].filter((open) => open !== key))
				:	openRow(ast, rule, key, { ...options, expanded: previous }),
			),
	}
}
