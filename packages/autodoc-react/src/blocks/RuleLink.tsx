import { AutodocButtonNavigationContext } from '../components/AutodocNavigationContext'
import { AutodocLinkNavigationContext } from '../components/AutodocNavigationContext'
import { AutodocEvaluationTraceContext } from '../components/AutodocEvaluationTraceContext'
import { useContext, type ReactElement, type ReactNode } from 'react'

/**
 * Navigation to another rule's page. When the host offers only in-place
 * navigation the control is a button — but it reads as a link, because that is
 * what it is. With no navigation offered at all it is text: there is nowhere
 * to go, so nothing pretends otherwise.
 */
export function RuleLink({
	address,
	children,
}: {
	address: string
	children: ReactNode
}): ReactElement {
	const link = useContext(AutodocLinkNavigationContext)
	const button = useContext(AutodocButtonNavigationContext)
	const { contextStackId } = useContext(AutodocEvaluationTraceContext)

	if (link?.LinkComponent && link.getHref) {
		const Link = link.LinkComponent
		return <Link href={link.getHref(address)}>{children}</Link>
	}
	if (link?.getHref) return <a href={link.getHref(address)}>{children}</a>
	if (button)
		return (
			<button
				type="button"
				className="publicodes-link"
				onClick={() => button.onNavigate(address, contextStackId)}
			>
				{children}
			</button>
		)
	return <span className="publicodes-plain-ref">{children}</span>
}
