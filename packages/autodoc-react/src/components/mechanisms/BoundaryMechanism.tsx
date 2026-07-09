import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface BoundaryMechanismProps {
	mechanism: Ast.MinOfMechanism | Ast.MaxOfMechanism
	trace?: Trace
}

const LABELS: Record<string, string> = {
	min_of: 'le minimum de',
	max_of: 'le maximum de',
}

export function BoundaryMechanism({ mechanism, trace }: BoundaryMechanismProps): JSX.Element {
	return (
		<>
			<span className="publicodes-mechanism__label">{LABELS[mechanism.kind]}</span>
			<div role="list" className="publicodes-mechanism__list">
				{mechanism.parameters.map((item, i) => (
					<div role="listitem" key={i}>
						<ChainedValue node={item} trace={trace} />
					</div>
				))}
			</div>
		</>
	)
}
