import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { ChainedValue } from '../ChainedValue'

export interface FoldMechanismProps {
	mechanism: Ast.SumMechanism | Ast.ProductMechanism
	trace?: Trace
}

const OPERATOR: Record<string, string> = {
	sum: '+',
	product: '×',
}

export function FoldMechanism({
	mechanism,
	trace,
}: FoldMechanismProps): ReactElement {
	const operator = OPERATOR[mechanism.kind]

	return (
		<div role="list" className="publicodes-mechanism__list">
			{mechanism.parameters.map((item, i) => (
				<div role="listitem" key={i}>
					{i > 0 && (
						<span className="publicodes-fold__operator">{operator}</span>
					)}
					<ChainedValue node={item} trace={trace} />
				</div>
			))}
		</div>
	)
}
