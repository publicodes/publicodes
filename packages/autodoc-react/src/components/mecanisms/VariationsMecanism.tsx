import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface VariationsMecanismProps {
	mecanism: Ast.VariationMechanism
	trace?: Trace
}

export function VariationsMecanism({
	mecanism,
	trace,
}: VariationsMecanismProps): JSX.Element {
	const { conditions } = mecanism.parameters

	return (
		<ul className="publicodes-variations">
			{conditions.map(({ if: ifNode, then: thenNode }, i) => (
				<li className="publicodes-variations__condition" key={i}>
					<span className="publicodes-variations__label">si</span>
					<div className="publicodes-variations__if">
						<ChainedValue node={ifNode} trace={trace} />
					</div>
					<span className="publicodes-variations__label">alors</span>
					<div className="publicodes-variations__then">
						<ChainedValue node={thenNode} trace={trace} />
					</div>
				</li>
			))}
			{mecanism.parameters.else && (
				<li className="publicodes-variations__else">
					<span className="publicodes-variations__label">sinon</span>
					<ChainedValue node={mecanism.parameters.else} trace={trace} />
				</li>
			)}
		</ul>
	)
}
