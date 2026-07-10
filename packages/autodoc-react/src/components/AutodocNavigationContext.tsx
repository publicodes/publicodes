import type { ReactNode, ComponentType } from 'react'
import { createContext } from 'react'

export interface AutodocLinkNavigationContext {
	basePath: string
	LinkComponent?: ComponentType<{ href: string; children: ReactNode }>
	getHref?: (ruleName: string) => string
	currentURL?: string
}

export interface AutodocButtonNavigationContext {
	currentRule: string
	onNavigate: (ruleName: string) => void
}

export const AutodocLinkNavigationContext =
	createContext<AutodocLinkNavigationContext | null>(null)

export const AutodocButtonNavigationContext =
	createContext<AutodocButtonNavigationContext | null>(null)
