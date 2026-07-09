import { describe, it, expect } from 'vitest'
import { needsParens, PRECEDENCE } from './binary-expression'

describe('needsParens', () => {
	it('add + mul : no parens needed (mul > add)', () => {
		expect(needsParens('add', 'mul', 'left')).toBe(false)
		expect(needsParens('add', 'mul', 'right')).toBe(false)
	})

	it('mul + add : parens needed (add < mul)', () => {
		expect(needsParens('mul', 'add', 'left')).toBe(true)
		expect(needsParens('mul', 'add', 'right')).toBe(true)
	})

	it('same precedence add + add : no parens (associative)', () => {
		expect(needsParens('add', 'add', 'left')).toBe(false)
		expect(needsParens('add', 'add', 'right')).toBe(false)
	})

	it('same precedence sub + sub : parens needed both sides (non-associative)', () => {
		expect(needsParens('sub', 'sub', 'left')).toBe(true)
		expect(needsParens('sub', 'sub', 'right')).toBe(true)
	})

	it('same precedence div + div : parens needed both sides', () => {
		expect(needsParens('div', 'div', 'left')).toBe(true)
		expect(needsParens('div', 'div', 'right')).toBe(true)
	})

	it('same precedence pow : parens only on left (right-associative)', () => {
		expect(needsParens('pow', 'pow', 'left')).toBe(true)
		expect(needsParens('pow', 'pow', 'right')).toBe(false)
	})

	it('same precedence mul + mul : no parens (associative)', () => {
		expect(needsParens('mul', 'mul', 'left')).toBe(false)
		expect(needsParens('mul', 'mul', 'right')).toBe(false)
	})

	it('unknown operator defaults to no parens', () => {
		expect(needsParens('unknown', 'unknown', 'left')).toBe(false)
	})

	it('all operators are in PRECEDENCE table', () => {
		const operators = ['or', 'and', 'eq', 'noteq', 'gt', 'lt', 'gteq', 'lteq', 'add', 'sub', 'mul', 'div', 'pow']
		for (const op of operators) {
			expect(PRECEDENCE[op], op).toBeDefined()
		}
	})
})
