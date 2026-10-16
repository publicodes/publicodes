import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import type {
	ContextStackId,
	Evaluation,
	TraceValue,
} from '@publicodes/autodoc-core'
import { openRow, openedWithPage, projectRule } from '@publicodes/autodoc-core'
import { useContext, useState, type ReactElement } from 'react'
import { AutodocInteractionContext } from '../components/AutodocInteractionContext'
import { AutodocEvaluationTraceContext } from '../components/AutodocEvaluationTraceContext'
import { RuleComputation } from './RuleComputation'
import { RuleDescription } from './RuleDescription'
import { RuleHeader } from './RuleHeader'

export interface RulePageProps {
	ast: PublicodeAST
	rule: string
	/** What the evaluation left behind; without it the page shows the structure. */
	evaluation?: Evaluation
	contextStackId?: ContextStackId
	context?: Record<string, TraceValue>
}

/**
 * The default page: the blocks, in the order the specification gives them, rendered
 * from one projection. The library's whole state is here — which rows are open, the
 * reader's own and the ones the page opened for them, and which held-back terms they
 * asked for — and the projection turns it into a view, so no block holds any.
 */
export function RulePage({
	ast,
	rule,
	evaluation,
	contextStackId,
	context,
}: RulePageProps): ReactElement {
	const inherited = useContext(AutodocEvaluationTraceContext)
	const stack = contextStackId ?? inherited.contextStackId
	const [expanded, setExpanded] = useState<ReadonlySet<string>>(() =>
		openedWithPage(ast, rule, { evaluation, contextStackId: stack, context }),
	)
	// what the page opened on its own is a state change, not a view the render derives
	// again: the reader closes those rows like any other, and keeps them closed
	const [page, setPage] = useState({ rule, stack })
	const [folds, setFolds] = useState<Readonly<Record<string, boolean>>>({})
	const options = {
		evaluation,
		contextStackId: stack,
		context,
		folds,
	}
	if (page.rule !== rule || page.stack !== stack) {
		setPage({ rule, stack })
		setExpanded(
			(previous) =>
				new Set([...previous, ...openedWithPage(ast, rule, options)]),
		)
	}
	const view = projectRule(ast, rule, { ...options, expanded })
	const interaction = {
		toggleRow: (key: string) =>
			setExpanded((previous) =>
				previous.has(key) ?
					new Set([...previous].filter((open) => open !== key))
				: openRow(ast, rule, key, { ...options, expanded: previous }),
			),
		toggleFold: (id: string, open: boolean) =>
			setFolds((previous) => ({ ...previous, [id]: open })),
	}
	return (
		<AutodocInteractionContext.Provider value={interaction}>
			<AutodocEvaluationTraceContext.Provider
				value={{ contextStackId: stack }}
			>
				<div className="publicodes-rule-page">
					<RuleHeader view={view} />
					<RuleDescription view={view} />
					<RuleComputation view={view} />
				</div>
			</AutodocEvaluationTraceContext.Provider>
		</AutodocInteractionContext.Provider>
	)
}
