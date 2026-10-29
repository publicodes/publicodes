import type { AutodocLinkProps } from '../components/AutodocContext'
import { useAutodocLinks } from '../components/AutodocContext'
import { useAutodocPage } from '../components/AutodocPageContext'
import type { ReactElement, ReactNode } from 'react'

/** With no navigation offered, a name is text: there is nowhere to go, nothing pretends. */
function PlainRef({ className, children }: AutodocLinkProps): ReactElement {
	return (
		<span
			className={
				className ? `${className} publicodes-plain-ref` : 'publicodes-plain-ref'
			}
		>
			{children}
		</span>
	)
}

/**
 * Navigation to another rule's page, under the stack the reader is reading. The host says
 * what a link is — an anchor, its router's link, a button — and this only says which rule
 * and which stack it leads to.
 */
export function RuleLink({
	address,
	children,
	className,
	stack: given,
}: {
	address: string
	children: ReactNode
	/** The caller's own class, for the cases the library draws the element. */
	className?: string
	/** The stack to lead under; the page's own by default. */
	stack?: string
}): ReactElement {
	const { Link = PlainRef } = useAutodocLinks()
	const fromPage = useAutodocPage().stack
	const stack = given ?? fromPage
	return (
		<Link
			rule={address}
			stack={stack}
			className={className ? `${className} publicodes-link` : 'publicodes-link'}
		>
			{children}
		</Link>
	)
}
