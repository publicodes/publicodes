import { ContextStackId } from '@publicodes/autodoc-core'
import type { ReactNode, ComponentType } from 'react'
import { createContext, useContext } from 'react'

export interface AutodocLinkNavigationContext {
	basePath: string
	LinkComponent?: ComponentType<{ href: string; children: ReactNode }>
	getHref?: (ruleName: string) => string
	currentURL?: string
}

export interface AutodocButtonNavigationContext {
	rule: string
	contextStackId: ContextStackId
	onNavigate: (rule: string, contextStackId: ContextStackId) => void
}

export const AutodocLinkNavigationContext =
	createContext<AutodocLinkNavigationContext | null>(null)

export const AutodocButtonNavigationContext =
	createContext<AutodocButtonNavigationContext | null>(null)

/**
 * Whether the host offered anywhere to go. A control that leads to a rule's page
 * is only drawn when this is true: with no navigation there is no page to show,
 * and a control that does nothing is worse than no control.
 */
export function useRuleNavigation(): boolean {
	const link = useContext(AutodocLinkNavigationContext)
	const button = useContext(AutodocButtonNavigationContext)
	return Boolean(link?.getHref ?? link?.LinkComponent ?? button)
}
