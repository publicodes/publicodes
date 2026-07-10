import { ChainedValue, ContextMechanism } from '../dist/ast'

export function getContextMechanism(
	node: ChainedValue,
): ContextMechanism | undefined {
	return node.chained_mechanisms.find(
		(mechanism) => mechanism.kind === 'context',
	)
}
