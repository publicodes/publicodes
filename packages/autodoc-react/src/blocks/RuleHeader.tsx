import type { ReactElement } from 'react'

export function RuleHeader({
	name,
	address,
}: {
	name: string
	/** The dotted name: an address, not a name, and printed as one. */
	address: string
}): ReactElement {
	return (
		<header className="publicodes-rule-header">
			<h1>{name}</h1>
			<div className="publicodes-address">{address}</div>
		</header>
	)
}
