import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface CombinationMechanismProps {
	mechanism: Ast.AllOfMechanism | Ast.OneOfMechanism
	trace?: Trace
}

const LABELS: Record<string, string> = {
	all_of: 'toutes ces conditions',
	one_of: 'une de ces conditions',
}

export function CombinationMechanism({ mechanism, trace }: CombinationMechanismProps): JSX.Element {
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
