import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { ChainedMechanism } from './ChainedMechanism'
import { ValueMechanism } from './ValueMechanism'

export interface ChainedValueProps {
	node: Ast.ChainedValue
	trace?: Trace
}

export function ChainedValue({ node, trace }: ChainedValueProps): ReactElement {
	return (
		<>
			<ValueMechanism mechanism={node.value_mechanism} trace={trace} />
			{node.chained_mechanisms.length > 0 && (
				<div role="list" className="publicodes-chained-mechanisms">
					{node.chained_mechanisms.map((mechanism, i) => (
						<div role="listitem" key={mechanism.id ?? i}>
							<ChainedMechanism mechanism={mechanism} trace={trace} />
						</div>
					))}
				</div>
			)}
		</>
	)
}
