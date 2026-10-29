import type {
	CompiledModule,
	Evaluation,
	TraceValue,
} from '@publicodes/autodoc-core'
import type { PublicodeAST } from '@publicodes/autodoc-core/ast'
import type { ReactElement } from 'react'
import { AutodocPageContext } from '../components/AutodocPageContext'
import { useContextStack } from '../navigation'
import { useRulePage } from '../useRulePage'
import { RuleComputation } from './RuleComputation'
import { RuleContext } from './RuleContext'
import { RuleDescription } from './RuleDescription'
import { RuleHeader } from './RuleHeader'
import { RuleUsage } from './RuleUsage'

export interface RulePageProps {
	module: CompiledModule
	ast: PublicodeAST
	rule: keyof CompiledModule['default']
	/** The reader's inputs; none means the model's own values. */
	context?: Record<string, TraceValue>
	/**
	 * The `contexte` stack to read the page under. Left out, it is the one the host's
	 * navigation carries — a URL parameter, or the history's own state.
	 */
	stack?: string
	/** A host that evaluates elsewhere (a full engine) passes its own trace. */
	evaluation?: Evaluation
}

/**
 * The default page: the blocks, in the order the specification gives them. It is a
 * composition of `useRulePage`, nothing more — a host that wants another arrangement
 * calls the hook and composes the blocks itself.
 */
export function RulePage({
	module,
	ast,
	rule: ruleName,
	context,
	stack: given,
	evaluation,
}: RulePageProps): ReactElement {
	const carried = useContextStack()
	const { rule, contextBlock, usage, page } = useRulePage({
		module,
		ast,
		rule: ruleName,
		context,
		stack: given ?? carried,
		evaluation,
	})
	return (
		<AutodocPageContext.Provider value={page}>
			<div className="publicodes-rule-page">
				<RuleHeader name={rule.name} address={rule.address} />
				<RuleDescription description={rule.description} />
				<RuleComputation view={rule} />
				{contextBlock !== null && <RuleContext view={contextBlock} />}
				<RuleUsage rows={usage} />
			</div>
		</AutodocPageContext.Provider>
	)
}
