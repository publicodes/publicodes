import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface VariationsMechanismProps {
	mechanism: Ast.VariationMechanism
	trace?: Trace
}

export function VariationsMechanism({
	mechanism,
	trace,
}: VariationsMechanismProps): JSX.Element {
	const { conditions } = mechanism.parameters

	return (
		<div role="list" >
			{conditions.map(({ if: ifNode, then: thenNode }, i) => (
				<div role="listitem" className="publicodes-variations__condition" key={i}>
					<span className="publicodes-variations__label">si</span>
					<div className="publicodes-variations__if">
						<ChainedValue node={ifNode} trace={trace} />
					</div>
					<span className="publicodes-variations__label">alors</span>
					<div className="publicodes-variations__then">
						<ChainedValue node={thenNode} trace={trace} />
					</div>
				</div>
			))}
			{mechanism.parameters.else && (
				<div role="listitem" className="publicodes-variations__else">
					<span className="publicodes-variations__label">sinon</span>
					<div className="publicodes-variations__value">
						<ChainedValue node={mechanism.parameters.else} trace={trace} />
					</div>
				</div>
			)}
		</div>
	)
}
