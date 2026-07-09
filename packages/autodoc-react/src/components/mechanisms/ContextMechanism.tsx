import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'
import { useContext } from 'react'
import { AutodocContext } from '../AutodocContext'

export interface ContextMechanismProps {
	mechanism: Ast.ContextMechanism
	trace?: Trace
}

export function ContextMechanism({
	mechanism,
	trace,
}: ContextMechanismProps): JSX.Element {
	const { push, pop } = useContext(AutodocContext)
	return (
		<>
			<div>
				<button onClick={() => push(mechanism.id)}>Appliquer</button>
				<button onClick={pop}>Désactiver</button>
			</div>
			<span className="publicodes-mechanism__label">avec le contexte</span>
			<div role="list" className="publicodes-mechanism__list">
				{Object.entries(mechanism.parameters).map(([key, item]) => (
					<div role="listitem" key={key}>
						<span className="publicodes-mechanism__key">{key} = </span>
						<ChainedValue node={item} trace={trace} />
					</div>
				))}
			</div>
		</>
	)
}
