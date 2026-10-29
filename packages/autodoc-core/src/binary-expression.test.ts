import { describe, it, expect } from 'vitest'
import { flattens, inverts, needsParens, PRECEDENCE } from './binary-expression'

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
		const operators = [
			'or',
			'and',
			'eq',
			'noteq',
			'gt',
			'lt',
			'gteq',
			'lteq',
			'add',
			'sub',
			'mul',
			'div',
			'pow',
		]
		for (const op of operators) {
			expect(PRECEDENCE[op], op).toBeDefined()
		}
	})
})

describe('flattens', () => {
	it('opens a chain of the same precedence, in both directions of its family', () => {
		expect(flattens('add', 'add')).toBe(true)
		expect(flattens('add', 'sub')).toBe(true)
		expect(flattens('sub', 'add')).toBe(true)
		expect(flattens('sub', 'sub')).toBe(true)
		expect(flattens('mul', 'div')).toBe(true)
		expect(flattens('div', 'mul')).toBe(true)
	})

	it('keeps a power and a comparison nested: their nesting is the meaning', () => {
		expect(flattens('pow', 'pow')).toBe(false)
		expect(flattens('eq', 'eq')).toBe(false)
		expect(flattens('lt', 'lt')).toBe(false)
	})

	it('keeps a different precedence nested', () => {
		expect(flattens('add', 'mul')).toBe(false)
		expect(flattens('mul', 'add')).toBe(false)
		expect(flattens('and', 'or')).toBe(false)
	})
})

describe('inverts', () => {
	it('turns the operators of the line a subtraction or a division opens', () => {
		expect(inverts('sub')).toBe(true)
		expect(inverts('div')).toBe(true)
		expect(inverts('add')).toBe(false)
		expect(inverts('mul')).toBe(false)
	})
})
