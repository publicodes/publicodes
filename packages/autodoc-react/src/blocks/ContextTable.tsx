import type { ContextEntryView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { Value } from './Value'

/**
 * The values a computation was evaluated against, one line each: the state of an
 * entry is a quiet qualifier, and an entry the evaluation found nothing for is the
 * only thing in the absence colour. Printed as the page's context block, and as the
 * table a `contexte` mechanism opens — where the mechanism's own word takes the
 * operator column, so the table starts on one line with what it is.
 */
export function ContextTable({
	entries,
	label,
}: {
	entries: ContextEntryView[]
	/** The mechanism's word, when the table is the one a `contexte` opens. */
	label?: string
}): ReactElement {
	const word =
		label === undefined ? null : (
			<span className="publicodes-row__label publicodes-row__label--word">
				{label}
			</span>
		)
	return (
		<table className="publicodes-context">
			<thead>
				<tr>
					{word !== null && (
						<td className="publicodes-context__label">{word}</td>
					)}
					<th scope="col">
						<span className="publicodes-row__label publicodes-row__label--word">
							Paramètre
						</span>
					</th>
					<th scope="col">
						<span className="publicodes-row__label publicodes-row__label--word">
							Valeur
						</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{entries.map((entry) => (
					<tr key={entry.address}>
						{word !== null && <td className="publicodes-context__label" />}
						<td>{entry.name}</td>
						<td>
							{entry.state === 'non renseignée' ?
								<span className="publicodes-absence">non renseignée</span>
							:	<>
									<Value value={entry.value} />
									{entry.qualifier !== null && (
										<span className="publicodes-qualifier">
											{' '}
											{entry.qualifier}
										</span>
									)}
								</>
							}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}
