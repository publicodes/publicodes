import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface CombinationMecanismProps {
	mecanism: Ast.AllOfMechanism | Ast.OneOfMechanism
	trace?: Trace
}

const LABELS: Record<string, string> = {
	all_of: 'toutes ces conditions',
	one_of: 'une de ces conditions',
}

export function CombinationMecanism({ mecanism, trace }: CombinationMecanismProps): JSX.Element {
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
