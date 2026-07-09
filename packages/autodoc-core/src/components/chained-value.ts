import type * as AST from '../ast/'
import type { Trace } from '../trace'

export interface UseEvaluableValueOptions {
	trace?: Trace
}

export function useEvaluableValue(
	_node: AST.ChainedValue,
	_options: UseEvaluableValueOptions = {},
) {}
