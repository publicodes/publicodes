import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface ValueProps {
	mechanism: Ast.Value
	trace?: Trace
}

export function Value({ mechanism, trace }: ValueProps): JSX.Element {
	return <ChainedValue node={mechanism.parameters} trace={trace} />
}
