import { ChainedValue, ContextMechanism } from './ast'

export function getContextMechanism(
	node: ChainedValue,
): ContextMechanism | undefined {
	return node.chained_mechanisms.find(
		(mechanism) => mechanism.kind === 'context',
	)
}
