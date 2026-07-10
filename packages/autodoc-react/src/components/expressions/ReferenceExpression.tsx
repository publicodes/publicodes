import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { getRefDisplayName } from '@publicodes/autodoc-core'
import { useContext } from 'react'
import {
	AutodocLinkNavigationContext,
	AutodocButtonNavigationContext,
} from '../AutodocNavigationContext'
import { AutodocRuleContext } from '../AutodocRuleContext'

export interface ReferenceExpressionProps {
	expression: Ast.ReferenceExpression
	trace?: Trace
}

export function ReferenceExpression({
	expression,
}: ReferenceExpressionProps): JSX.Element {
	const linkNav = useContext(AutodocLinkNavigationContext)
	const buttonNav = useContext(AutodocButtonNavigationContext)
	const ruleCtx = useContext(AutodocRuleContext)

	const ruleName = expression.parameters

	const displayName = ruleCtx
		? getRefDisplayName(
				ruleName,
				ruleCtx.currentRule,
				ruleCtx.doc as Record<string, { title?: string }>,
			)
		: ruleName

	if (linkNav) {
		const { LinkComponent, basePath, getHref } = linkNav
		const href = getHref ? getHref(ruleName) : `${basePath}/${ruleName}`
		return (
			<span className="publicodes-expression publicodes-expression--ref">
				{LinkComponent ? (
					<LinkComponent href={href}>{displayName}</LinkComponent>
				) : (
					<a href={href}>{displayName}</a>
				)}
			</span>
		)
			</span>
		)
	}

	if (buttonNav) {
		return (
			<button
				className="publicodes-expression publicodes-expression--ref"
				onClick={() => buttonNav.onNavigate(ruleName)}
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
