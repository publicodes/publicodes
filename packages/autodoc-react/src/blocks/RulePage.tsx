import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import type { ContextStackId, Trace, TraceValue } from '@publicodes/autodoc-core'
import { projectRule } from '@publicodes/autodoc-core'
import { useContext, useState, type ReactElement } from 'react'
import { AutodocEvaluationTraceContext } from '../components/AutodocEvaluationTraceContext'
import { RuleComputation } from './RuleComputation'
import { RuleDescription } from './RuleDescription'
import { RuleHeader } from './RuleHeader'
import { RuleParameters } from './RuleParameters'
import { RuleProvenance } from './RuleProvenance'
import { RuleUsedBy } from './RuleUsedBy'
import type { Env } from './types'

export interface RulePageProps {
	ast: PublicodeAST
	rule: string
	trace?: Trace
	contextStackId?: ContextStackId
	context?: Record<string, TraceValue>
	/** The parameters the evaluation used, from its own `needed` list. */
	usedParameters?: readonly string[]
	/** Those it found no value for, from its own `missing` list. */
	missing?: readonly string[]
	/** The rule those two lists describe. */
	evaluatedRule?: string
}

/** The default page: the blocks, in the order the specification gives them. */
export function RulePage({
	ast,
	rule,
	trace,
	contextStackId,
	context,
	usedParameters,
	missing,
	evaluatedRule,
}: RulePageProps): ReactElement {
	const inherited = useContext(AutodocEvaluationTraceContext)
	const stack = contextStackId ?? inherited.contextStackId
	const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set())
	const project = (address: string): ReturnType<typeof projectRule> =>
		projectRule(ast, address, {
			trace,
			contextStackId: stack,
			context,
			usedParameters,
			missing,
			evaluatedRule,
		})
	const view = project(rule)

	const env: Env = {
		ast,
		trace,
		contextStackId: stack,
		context,
		expanded,
		toggleExpanded: (address) =>
			setExpanded((previous) => {
				const next = new Set(previous)
				if (next.has(address)) next.delete(address)
				else next.add(address)
				return next
			}),
		project,
	}

	return (
		<div className="publicodes-rule-page">
			<RuleHeader view={view} />
			<RuleDescription view={view} />
			<RuleComputation view={view} env={env} />
			<RuleParameters view={view} />
			<RuleUsedBy view={view} env={env} />
			<RuleProvenance view={view} />
		</div>
	)
}
