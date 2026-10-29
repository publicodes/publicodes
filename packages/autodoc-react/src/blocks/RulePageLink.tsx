import { useAutodocLinks } from '../components/AutodocContext'
import type { ReactElement } from 'react'
import { RuleLink } from './RuleLink'

/**
 * The way to the page of the rule whose fiche is open, beside its name. Shown
 * only where the host has somewhere to go: with no navigation there is no page
 * to show, and the line stays bare rather than promising what it cannot do.
 */
export function RulePageLink({
	address,
	name,
}: {
	address: string
	name: string
}): ReactElement | null {
	if (useAutodocLinks().Link === undefined) return null
	const label = `Ouvrir la page de ${name}`
	return (
		<RuleLink
			address={address}
			className="publicodes-control publicodes-page-link"
		>
			<svg
				className="publicodes-control__icon"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path d="M7 7h10v10" />
				<path d="M7 17 17 7" />
			</svg>
			<span className="publicodes-visually-hidden">{label}</span>
		</RuleLink>
	)
}
