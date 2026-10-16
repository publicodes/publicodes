import type { ContextEntryView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { Value } from './Value'

/**
 * The context of the computation, as the page-level block prints it: the evaluation's
 * parameters, one line each, with the state of each as a quiet qualifier. What a
 * `contexte` mechanism binds is not a table — those values are lines of the computation,
 * so `Equation` prints them.
 */
export function ContextTable({
	entries,
}: {
	entries: ContextEntryView[]
}): ReactElement {
	return (
		<table className="publicodes-context">
			<thead>
				<tr>
					<th scope="col">Paramètre</th>
					<th scope="col">Valeur</th>
				</tr>
			</thead>
			<tbody>
				{entries.map((entry) => (
					<tr key={entry.address}>
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
