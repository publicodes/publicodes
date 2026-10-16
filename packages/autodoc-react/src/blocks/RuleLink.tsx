import { AutodocButtonNavigationContext } from '../components/AutodocNavigationContext'
import { AutodocLinkNavigationContext } from '../components/AutodocNavigationContext'
import { AutodocEvaluationTraceContext } from '../components/AutodocEvaluationTraceContext'
import { useContext, type ReactElement, type ReactNode } from 'react'

/**
 * Navigation to another rule's page. When the host offers only in-place
 * navigation the control is a button — but it reads as a link, because that is
 * what it is. With no navigation offered at all it is text: there is nowhere
 * to go, so nothing pretends otherwise. A host that passes its own `LinkComponent`
 * owns that link's look, so `className` is not forced onto it.
 */
export function RuleLink({
	address,
	children,
	className,
}: {
	address: string
	children: ReactNode
	/** The caller's own class, for the cases the library draws the element. */
	className?: string
}): ReactElement {
	const link = useContext(AutodocLinkNavigationContext)
	const button = useContext(AutodocButtonNavigationContext)
	const { contextStackId } = useContext(AutodocEvaluationTraceContext)

	if (link?.LinkComponent && link.getHref) {
		const Link = link.LinkComponent
		return <Link href={link.getHref(address)}>{children}</Link>
	}
	if (link?.getHref)
		return (
			<a
				className={className ? `${className} publicodes-link` : 'publicodes-link'}
				href={link.getHref(address)}
			>
				{children}
			</a>
		)
	if (button)
		return (
			<button
				type="button"
				className={className ? `${className} publicodes-link` : 'publicodes-link'}
				onClick={() => button.onNavigate(address, contextStackId)}
			>
				{children}
			</button>
		)
	return (
		<span className={className ? `${className} publicodes-plain-ref` : 'publicodes-plain-ref'}>
			{children}
		</span>
	)
}
