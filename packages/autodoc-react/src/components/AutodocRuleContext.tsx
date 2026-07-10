import { createContext } from 'react'
import type { PublicodeAST } from '@publicodes/autodoc-core/ast'

export interface AutodocRuleContext {
	doc: PublicodeAST
	currentRule: string
}

export const AutodocRuleContext = createContext<AutodocRuleContext | null>(null)
