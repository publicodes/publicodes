import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import type {
	ContextStackId,
	RuleView,
	Trace,
	TraceValue,
} from '@publicodes/autodoc-core'

/** What every view needs: the model, the evaluation, and what is unfolded. */
export interface Env {
	ast: PublicodeAST
	trace?: Trace
	contextStackId: ContextStackId
	context?: Record<string, TraceValue>
	expanded: ReadonlySet<string>
	toggleExpanded: (address: string) => void
	project: (address: string) => RuleView
}
