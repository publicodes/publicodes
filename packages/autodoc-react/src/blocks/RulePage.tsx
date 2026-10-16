import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import type {
	ContextStackId,
	Evaluation,
	TraceValue,
} from '@publicodes/autodoc-core'
import { projectRule } from '@publicodes/autodoc-core'
import { useContext, useState, type ReactElement } from 'react'
import { AutodocInteractionContext } from '../components/AutodocInteractionContext'
import { AutodocEvaluationTraceContext } from '../components/AutodocEvaluationTraceContext'
import { RuleComputation } from './RuleComputation'
import { RuleDescription } from './RuleDescription'
import { RuleHeader } from './RuleHeader'
import { RuleParameters } from './RuleParameters'
import { RuleProvenance } from './RuleProvenance'
import { RuleUsedBy } from './RuleUsedBy'

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
 * from one projection. The library's whole state is here — which rows the reader
 * opened, and which held-back terms they asked for — and the projection turns it
 * into a view, so no block holds any.
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
	const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set())
	const [folds, setFolds] = useState<Readonly<Record<string, boolean>>>({})
	const view = projectRule(ast, rule, {
		evaluation,
		contextStackId: stack,
		context,
		expanded,
		folds,
	})
	const interaction = {
		toggleRow: (key: string) =>
			setExpanded((previous) => {
				const next = new Set(previous)
				if (next.has(key)) next.delete(key)
				else next.add(key)
				return next
			}),
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
					<RuleParameters view={view} />
					<RuleUsedBy view={view} />
					<RuleProvenance view={view} />
				</div>
			</AutodocEvaluationTraceContext.Provider>
		</AutodocInteractionContext.Provider>
	)
}
