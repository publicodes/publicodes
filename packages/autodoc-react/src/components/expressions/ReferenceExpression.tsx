import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { getRefDisplayName } from '@publicodes/autodoc-core'
import { useContext } from 'react'
import { AutodocButtonNavigationContext } from '../AutodocNavigationContext'
import { AutodocRuleContext } from '../AutodocRuleContext'
import { AutodocEvaluationTraceContext } from '../AutodocEvaluationTraceContext'

export interface ReferenceExpressionProps {
	expression: Ast.ReferenceExpression
	trace?: Trace
}

export function ReferenceExpression({
	expression,
}: ReferenceExpressionProps): JSX.Element {
	const buttonNav = useContext(AutodocButtonNavigationContext)
	const ruleCtx = useContext(AutodocRuleContext)
	const { contextStackId } = useContext(AutodocEvaluationTraceContext)

	const ruleName = expression.parameters

	const displayName =
		buttonNav && ruleCtx ?
			getRefDisplayName(
				ruleName,
				buttonNav.rule,
				ruleCtx.doc as Record<string, { title?: string }>,
			)
		:	ruleName

	if (buttonNav) {
		return (
			<button
				className="publicodes-expression publicodes-expression--ref"
				onClick={() => buttonNav.onNavigate(ruleName, contextStackId)}
			>
				{displayName}
			</button>
		)
	}

	return (
		<span className="publicodes-expression publicodes-expression--ref">
			{displayName}
		</span>
	)
}
