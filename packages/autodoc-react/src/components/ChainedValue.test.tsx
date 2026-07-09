import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ChainedValue } from './ChainedValue'
import type * as Ast from '@publicodes/autodoc-core/ast'

const emptyContextParams: Record<string, Ast.ChainedValue> = {}

const chainedValueNode = {
	value_mechanism: {
		kind: 'expr' as const,
		id: 'v1',
		type: 'number' as const,
		position: {
			file: 'test.publicodes',
			start: { index: 0, line: 1, column: 1 },
			end: { index: 10, line: 1, column: 10 },
		},
		parameters: {
			kind: 'ref' as const,
			id: 'ref-1',
			type: 'number' as const,
			position: {
				file: 'test.publicodes',
				start: { index: 0, line: 2, column: 1 },
				end: { index: 5, line: 2, column: 5 },
			},
			parameters: 'some-rule',
		},
	},
	chained_mechanisms: [
		{
			kind: 'applicable_if' as const,
			id: 'c1',
			type: 'boolean' as const,
			position: {
				file: 'test.publicodes',
				start: { index: 0, line: 3, column: 1 },
				end: { index: 10, line: 3, column: 10 },
			},
			parameters: {
				value_mechanism: {
					kind: 'expr' as const,
					id: 'c1-v',
					type: 'number' as const,
					position: {
						file: 'test.publicodes',
						start: { index: 0, line: 4, column: 1 },
						end: { index: 10, line: 4, column: 10 },
					},
					parameters: {
						kind: 'ref' as const,
						id: 'ref-2',
						type: 'number' as const,
						position: {
							file: 'test.publicodes',
							start: { index: 0, line: 5, column: 1 },
							end: { index: 5, line: 5, column: 5 },
						},
						parameters: 'other-rule',
					},
				},
				chained_mechanisms: [],
			},
		},
		{
			kind: 'context' as const,
			id: 'c2',
			type: 'number' as const,
			position: {
				file: 'test.publicodes',
				start: { index: 0, line: 6, column: 1 },
				end: { index: 10, line: 6, column: 10 },
			},
			parameters: emptyContextParams,
		},
	],
} satisfies Ast.ChainedValue

describe('ChainedValue', () => {
	it('renders chained mechanisms in a ul', () => {
		const { container } = render(<ChainedValue node={chainedValueNode} />)

		const ul = container.querySelector('.publicodes-chained-mechanisms')
		expect(ul).toBeTruthy()
		expect(ul!.tagName).toBe('DIV')
		expect(ul!.getAttribute('role')).toBe('list')
	})

	it('renders chained mechanisms', () => {
		const { container } = render(<ChainedValue node={chainedValueNode} />)

		expect(container.querySelector('.publicodes-applicable_if')).toBeTruthy()
		expect(container.querySelector('.publicodes-context')).toBeTruthy()
	})

	it('renders value mechanism with a sub-component class', () => {
		const { container } = render(<ChainedValue node={chainedValueNode} />)

		expect(container.querySelector('.publicodes-expr')).toBeTruthy()
	})

	it('renders chained mechanisms before the value mechanism', () => {
		const { container } = render(<ChainedValue node={chainedValueNode} />)

		const ul = container.querySelector('.publicodes-chained-mechanisms')
		const expr = container.querySelector('.publicodes-expr')
		expect(ul).toBeTruthy()
		expect(expr).toBeTruthy()

		// ul should appear before the expr mechanism in DOM order
		const html = container.innerHTML
		expect(html.indexOf('publicodes-chained-mechanisms')).toBeLessThan(
			html.indexOf('publicodes-expr'),
		)
	})
})
