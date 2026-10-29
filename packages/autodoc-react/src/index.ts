export * from '@publicodes/autodoc-core/ast'

export { Autodoc } from './components/AutodocContext'
export type { AutodocLinkProps } from './components/AutodocContext'
export { AutodocPageContext } from './components/AutodocPageContext'
export type { AutodocPage } from './components/AutodocPageContext'

export {
	createPathLink,
	useButtonNavigation,
	useContextStack,
} from './navigation'
export type { Anchor } from './navigation'
export { useRulePage } from './useRulePage'
export type { RulePageOptions, RulePageState } from './useRulePage'

export {
	Explanation,
	RuleComputation,
	RuleContext,
	RuleDescription,
	RuleHeader,
	RuleIndex,
	RuleLink,
	RulePage,
	RuleProvenance,
	RuleUsage,
} from './blocks'
export type { RulePageProps } from './blocks'
