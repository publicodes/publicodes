import type { PathNavigation } from '@publicodes/autodoc-core'
import { contextStackFromUrl } from '@publicodes/autodoc-core'
import type { ComponentType, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import type { AutodocLinkProps } from './components/AutodocContext'
import { useAutodocLinks } from './components/AutodocContext'

/** The element a path becomes: the library's own anchor unless the host has a router. */
export type Anchor = ComponentType<{
	href: string
	className?: string
	children: ReactNode
}>

const anchor: Anchor = ({ href, className, children }) => (
	<a className={className} href={href}>
		{children}
	</a>
)

/**
 * The link of a site whose pages are the model's own paths: `paths.href` writes the URL,
 * the stack included, and `Anchor` is the host's own anchor when it has a router.
 */
export function createPathLink(
	paths: PathNavigation,
	Anchor: Anchor = anchor,
): ComponentType<AutodocLinkProps> {
	return function PathLink({ rule, stack, className, children }) {
		return (
			<Anchor href={paths.href(rule, stack)} className={className}>
				{children}
			</Anchor>
		)
	}
}

/**
 * The stack the current page is read under. A host whose URLs carry it — what
 * `createPathNavigation` writes — has nothing to do; one that keeps it elsewhere passes
 * `stackFrom` beside its `Link`, or the `stack` prop of `RulePage`.
 */
export function useContextStack(): string {
	const { stackFrom } = useAutodocLinks()
	if (stackFrom !== undefined) return stackFrom()
	if (typeof window === 'undefined') return ''
	return contextStackFromUrl(window.location.href)
}

/**
 * The navigation of a host with no URLs: the rule and the stack live in the host's state,
 * and this hook is that state. It hands back the `Link` to give `<Autodoc>`, and the two
 * values the page needs.
 */
export function useButtonNavigation(start: string): {
	Link: ComponentType<AutodocLinkProps>
	rule: string
	stack: string
} {
	const [at, setAt] = useState({ rule: start, stack: '' })
	const Link = useMemo(
		(): ComponentType<AutodocLinkProps> =>
			function ButtonLink({ rule, stack, className, children }) {
				return (
					<button
						type="button"
						className={className}
						onClick={() => setAt({ rule, stack })}
					>
						{children}
					</button>
				)
			},
		[],
	)
	return { Link, rule: at.rule, stack: at.stack }
}
