import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import type { ReactElement } from 'react'
import { ChainedMechanism } from './ChainedMechanism'
import { ValueMechanism } from './ValueMechanism'
import { AutodocEvaluationTraceProvider } from './AutodocEvaluationTraceContext'
import { getContextMechanism } from '@publicodes/autodoc-core'

export interface ChainedValueProps {
	node: Ast.ChainedValue
	trace?: Trace
}

export function ChainedValue({ node, trace }: ChainedValueProps): ReactElement {
	const contextMecha = getContextMechanism(node)

	return contextMecha ?
			<AutodocEvaluationTraceProvider contextId={contextMecha.id}>
				<ChainedValueRaw node={node} trace={trace} />
			</AutodocEvaluationTraceProvider>
		:	<ChainedValueRaw node={node} trace={trace} />
}

function ChainedValueRaw({ node, trace }: ChainedValueProps): ReactElement {
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
