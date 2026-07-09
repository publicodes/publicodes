import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface ContextMechanismProps {
	mecanism: Ast.ContextMechanism
	trace?: Trace
}

export function ContextMechanism({ mecanism, trace }: ContextMechanismProps): JSX.Element {
	return (
		<>
			<span className="publicodes-mecanism__label">dans :</span>
			<ul className="publicodes-mecanism__list">
				{Object.entries(mecanism.parameters).map(([key, item]) => (
					<li key={key}>
						<span className="publicodes-mecanism__key">{key} = </span>
						<ChainedValue node={item} trace={trace} />
					</li>
				))}
			</ul>
		</>
	)
}
