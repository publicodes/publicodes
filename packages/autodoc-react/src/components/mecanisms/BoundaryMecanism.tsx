import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface BoundaryMecanismProps {
	mecanism: Ast.MinOfMechanism | Ast.MaxOfMechanism
	trace?: Trace
}

const LABELS: Record<string, string> = {
	min_of: 'le minimum de',
	max_of: 'le maximum de',
}

export function BoundaryMecanism({ mecanism, trace }: BoundaryMecanismProps): JSX.Element {
	return (
		<>
			<span className="publicodes-mecanism__label">{LABELS[mecanism.kind]}</span>
			<ul className="publicodes-mecanism__list">
				{mecanism.parameters.map((item, i) => (
					<li key={i}>
						<ChainedValue node={item} trace={trace} />
					</li>
				))}
			</ul>
		</>
	)
}
