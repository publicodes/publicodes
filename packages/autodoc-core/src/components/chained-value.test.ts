import { describe, it, expect } from 'vitest'
import { useEvaluableValue } from './chained-value'
import type * as Ast from '../ast/'

describe('useEvaluableValue', () => {
	it('accepts a node', () => {
		const node = {
			value_mechanism: {
				kind: 'expr' as const,
				id: 'test',
				type: 'number' as const,
				position: {
					file: 'test.publicodes',
					start: { index: 0, line: 1, column: 1 },
					end: { index: 10, line: 1, column: 10 },
				},
				parameters: {
					kind: 'ref' as const,
					id: 'ref-test',
					type: 'number' as const,
					position: {
						file: 'test.publicodes',
						start: { index: 0, line: 2, column: 1 },
						end: { index: 5, line: 2, column: 5 },
					},
					parameters: 'some-rule',
				},
			},
			chained_mechanisms: [],
		} satisfies Ast.ChainedValue

		const result = useEvaluableValue(node)
		expect(result).toBeUndefined()
	})
})
