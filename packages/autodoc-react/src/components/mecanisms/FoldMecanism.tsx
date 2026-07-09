import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { ChainedValue } from '../ChainedValue'

export interface FoldMecanismProps {
	mecanism: Ast.SumMechanism | Ast.ProductMechanism
	trace?: Trace
}

const OPERATOR = {
	sum: '+',
	product: '×',
} as const

const LABEL= {
	sum: "somme",
	product: 'produit',
} as const


export function FoldMecanism({
	mecanism,
	trace,
}: FoldMecanismProps): ReactElement {
	const operator = OPERATOR[mecanism.kind]

	return (<>

	 <div className="publicodes-mechanism__label">{LABEL[mecanism.kind]}</div>
		<ul className="publicodes-mecanism__list">
			{mecanism.parameters.map((item, i) => (
				<li key={i}>
					{i > 0 && (
						<span className="publicodes-fold__operator">{operator}</span>
					)}
					<ChainedValue node={item} trace={trace} />
				</li>
			))}
		</ul>
	</>
	)
}
