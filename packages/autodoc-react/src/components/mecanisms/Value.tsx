import type * as Ast from '@publicodes/autodoc-core/ast'
import type { Trace } from '@publicodes/autodoc-core'
import { ChainedValue } from '../ChainedValue'

export interface ValueProps {
	mecanism: Ast.Value
	trace?: Trace
}

export function Value({ mecanism, trace }: ValueProps): JSX.Element {
	return <ChainedValue node={mecanism.parameters} trace={trace} />
}
