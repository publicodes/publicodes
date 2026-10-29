import type { ComponentType, PropsWithChildren, ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'

/** What a host's link receives: which rule, under which stack, with what class. */
export interface AutodocLinkProps {
	rule: string
	stack: string
	/** The library's own class, so the host's element keeps the page's look. */
	className?: string
	children: ReactNode
}

/** What the library needs from a site: how to lead to a rule, where its stack is written. */
interface AutodocLinks {
	Link?: ComponentType<AutodocLinkProps>
	stackFrom?: () => string
}

const LinksContext = createContext<AutodocLinks>({})

export const useAutodocLinks = (): AutodocLinks => useContext(LinksContext)

/**
 * The host's way of leading from a rule to another, set once for the whole site: an anchor,
 * a router link or a button, all the same to the library. The stack travels with the click,
 * so the target shows the computation the reader was reading.
 */
export function Autodoc({
	Link,
	stackFrom,
	children,
}: PropsWithChildren<AutodocLinks>) {
	const links = useMemo(() => ({ Link, stackFrom }), [Link, stackFrom])
	return <LinksContext.Provider value={links}>{children}</LinksContext.Provider>
}
