import { createContext, useContext } from 'react'

/**
 * What a page shares with the blocks under it: the only state the library keeps, and the
 * context stack the page is read under. `RulePage` provides it; a host that recomposes its
 * page provides the same value, which `useRulePage` hands it.
 */
export interface AutodocPage {
	/** The `contexte` stack this page shows, '' for the model's own. */
	stack: string
	/** Opens or closes a row, by the key its view carries. */
	toggleRow: (key: string) => void
	/** Shows or hides the terms an equation holds back, by its id. */
	toggleFold: (id: string, expanded: boolean) => void
}

export const AutodocPageContext = createContext<AutodocPage>({
	stack: '',
	toggleRow: () => {},
	toggleFold: () => {},
})

export const useAutodocPage = (): AutodocPage => useContext(AutodocPageContext)
