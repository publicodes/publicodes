import { useSyncExternalStore } from 'react'

/** Where the address bar points. The stack a page is read under is the library's part. */
export interface HashRoute {
	path: string
}

const HOME: HashRoute = { path: '/' }

// le navigateur percent-encode le fragment, les chemins de la navigation sont bruts
const parse = (hash: string): HashRoute => {
	const [path] = hash.replace(/^#/, '').split('?')
	const decode = (text: string) => {
		try {
			return decodeURIComponent(text)
		} catch {
			return text
		}
	}
	return { path: decode(path) || '/' }
}

// `useSyncExternalStore` re-rend tant que l'instantané change d'identité : la route n'est
// reconstruite que lorsque le fragment change, pas à chaque lecture
let lastHash: string | null = null
let lastRoute: HashRoute = HOME

const read = (): HashRoute => {
	if (window.location.hash !== lastHash) {
		lastHash = window.location.hash
		lastRoute = parse(lastHash)
	}
	return lastRoute
}

const readWithoutWindow = (): HashRoute => HOME

const subscribe = (onChange: () => void): (() => void) => {
	window.addEventListener('hashchange', onChange)
	return () => window.removeEventListener('hashchange', onChange)
}

/**
 * The address bar is the whole of the navigation: the page, and the `contexte` stack the
 * reader descended through, so a link leads to the computation the reader was reading.
 */
export function useHashRoute(): HashRoute {
	return useSyncExternalStore(subscribe, read, readWithoutWindow)
}

/** The URL of a page: this playground keeps its pages in the fragment. */
export const toUrl = (path: string): string => `#${path}`
