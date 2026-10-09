export * from '@publicodes/autodoc-core/ast'
export { useEvaluableValue } from '@publicodes/autodoc-core'

export {
	AutodocButtonNavigationContext,
	AutodocLinkNavigationContext,
} from './components/AutodocNavigationContext'
export type {
	AutodocButtonNavigationContext as AutodocButtonNavigationContextType,
	AutodocLinkNavigationContext as AutodocLinkNavigationContextType,
} from './components/AutodocNavigationContext'
export {
	AutodocEvaluationTraceContext,
	AutodocEvaluationTraceProvider,
} from './components/AutodocEvaluationTraceContext'

export {
	Fiche,
	RuleComputation,
	RuleDescription,
	RuleHeader,
	RuleNavigation,
	RulePage,
	RuleParameters,
	RuleProvenance,
	RuleUsedBy,
} from './blocks'
export type { RulePageProps } from './blocks'
