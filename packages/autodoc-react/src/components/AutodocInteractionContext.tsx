import { createContext, useContext } from 'react'

/**
 * What a block needs to answer a reader, and the only state the library keeps: the
 * page projects itself from these, so nothing else is shared.
 */
export interface AutodocInteraction {
	/** Opens or closes a row, by the key its view carries. */
	toggleRow: (key: string) => void
	/** Shows or hides the terms an equation holds back, by its id. */
	toggleFold: (id: string, expanded: boolean) => void
}

export const AutodocInteractionContext = createContext<AutodocInteraction>({
	toggleRow: () => {},
	toggleFold: () => {},
})

export const useAutodocInteraction = (): AutodocInteraction =>
	useContext(AutodocInteractionContext)
