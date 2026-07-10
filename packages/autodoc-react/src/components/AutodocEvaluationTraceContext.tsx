import { Uid } from '@publicodes/autodoc-core/ast'
import type { ContextStackId } from '@publicodes/autodoc-core'
import { createContext, PropsWithChildren, useContext } from 'react'
import { AutodocButtonNavigationContext } from './AutodocNavigationContext'

export interface AutodocEvaluationTraceContext {
	contextStackId: ContextStackId
}

export const AutodocEvaluationTraceContext =
	createContext<AutodocEvaluationTraceContext>({
		contextStackId: '',
	})

export function AutodocEvaluationTraceProvider({
	contextId,
	children,
}: PropsWithChildren<{ contextId?: Uid }>): JSX.Element {
	const { contextStackId: evaluationContextStackId } = useContext(
		AutodocEvaluationTraceContext,
	)
	const navContext = useContext(AutodocButtonNavigationContext)

	const contextStackId =
		evaluationContextStackId === '' && navContext ?
			navContext.contextStackId
		:	evaluationContextStackId

	console.log('contextStackId:', contextStackId)
	console.log('contextId:', contextId)

	return (
		<AutodocEvaluationTraceContext.Provider
			value={{
				contextStackId: contextStackId + '-' + contextId,
			}}
		>
			{children}
		</AutodocEvaluationTraceContext.Provider>
	)
}
