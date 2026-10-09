import type { RuleView } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { Value } from './Value'

/** The context of the computation: one style, the state as a quiet qualifier. */
export function RuleParameters({ view }: { view: RuleView }): ReactElement | null {
	if (view.context.length === 0) return null
	return (
		<section className="publicodes-rule-parameters">
			<h2>Contexte du calcul</h2>
			<table>
				<thead>
					<tr>
						<th scope="col">Entrée</th>
						<th scope="col">Valeur</th>
					</tr>
				</thead>
				<tbody>
					{view.context.map((entry) => (
						<tr key={entry.address}>
							<td>{entry.name}</td>
							<td>
								{entry.state === 'non renseignée' ?
									<span className="publicodes-absence">non renseignée</span>
								:	<>
										<Value value={entry.value} />
										{entry.state === 'par défaut' && (
											<span className="publicodes-qualifier"> (par défaut)</span>
										)}
									</>
								}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	)
}
