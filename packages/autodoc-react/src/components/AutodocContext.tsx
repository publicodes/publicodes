import { Uid } from '@publicodes/autodoc-core/ast'
import type { ContextStackId } from '@publicodes/autodoc-core'
import { createContext, PropsWithChildren, useState } from 'react'

export interface AutodocContext {
	push: (id: Uid) => void
	pop: () => Uid | undefined
	contextStackId: ContextStackId
}

export const AutodocContext = createContext<AutodocContext>({
	contextStackId: '',
	push: (_) => {},
	pop: () => undefined,
})

export function AutodocProvider({ children }: PropsWithChildren): JSX.Element {
	const [contextStack, setContextStack] = useState<Uid[]>([''])

	return (
		<AutodocContext.Provider
			value={{
				push: (id: Uid) => setContextStack([...contextStack, id]),
				pop: () => {
					if (contextStack.length === 1) {
						return undefined
					}
					const e = contextStack.pop()
					setContextStack([...contextStack])
					return e
				},
				contextStackId: contextStack.join('-'),
			}}
		>
			{children}
		</AutodocContext.Provider>
	)
}
