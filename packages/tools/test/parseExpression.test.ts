import { describe, it, expect } from 'vitest'
import { serializeParsedExprAST, substituteInParsedExpr } from '../src/commons'

describe('substituteInParsedExpr', () => {
	it('should return the same parsed expression if no occurence of the variable is found', () => {
		const parsedExpr = {
			constant: { type: 'number', nodeValue: 10 },
		}
		// @ts-expect-error FIXME: should export all sub types of ExprAST
		expect(substituteInParsedExpr(parsedExpr, 'A', '10')).toStrictEqual(
			parsedExpr,
		)
	})

	it('should substitute the variable with the constant value in a binary operation', () => {
		const parsedExpr = {
			'+': [{ variable: 'A' }, { variable: 'B' }],
		}
		const expected = {
			'+': [{ constant: { type: 'number', nodeValue: 10 } }, { variable: 'B' }],
		}
		// @ts-expect-error should export all sub types of ExprAST
		expect(substituteInParsedExpr(parsedExpr, 'A', '10')).toStrictEqual(
			expected,
		)
	})

	it('should substitute the variable (with a complex dotted name) with the constant value in a binary operation', () => {
		const parsedExpr = {
			'+': [{ variable: 'A . B . C . D' }, { variable: 'B' }],
		}
		const expected = {
			'+': [{ constant: { type: 'number', nodeValue: 10 } }, { variable: 'B' }],
		}
		expect(
			// @ts-expect-error should export all sub types of ExprAST
			substituteInParsedExpr(parsedExpr, 'A . B . C . D', '10'),
		).toStrictEqual(expected)
	})
})

describe('serializeParsedExprAST', () => {
	it('should serialize a simple constant node', () => {
		expect(
			serializeParsedExprAST({ constant: { type: 'number', nodeValue: 10 } }),
		).toStrictEqual('10')
	})

	it('should serialize a simple variable node', () => {
		expect(serializeParsedExprAST({ variable: 'A' })).toStrictEqual('A')
	})

	it('should serialize a simple binary operation', () => {
		expect(
			serializeParsedExprAST({ '+': [{ variable: 'A' }, { variable: 'B' }] }),
		).toStrictEqual('A + B')
	})

	it('should serialize a complex binary operation', () => {
		expect(
			serializeParsedExprAST({
				'+': [
					{ variable: 'A' },
					{
						'*': [{ variable: 'B' }, { variable: 'C' }],
					},
				],
			}),
		).toStrictEqual('A + (B * C)')
	})

	it('should serialize a complex binary operation with constants and units', () => {
		expect(
			serializeParsedExprAST({
				'+': [
					{ variable: 'A' },
					{
						'*': [
							{ constant: { type: 'number', nodeValue: 10 } },
							{
								'+': [
									{ variable: 'C' },
									{
										constant: {
											type: 'number',
											nodeValue: 50.5,
											rawUnit: 'km',
										},
									},
								],
							},
						],
					},
				],
			}),
		).toStrictEqual('A + (10 * (C + 50.5km))')
	})

	it('should use unary writing when applicable', () => {
		expect(
			serializeParsedExprAST({
				'-': [
					{ constant: { type: 'number', nodeValue: 0 } },
					{
						constant: {
							type: 'number',
							nodeValue: 10,
						},
					},
				],
			}),
		).toStrictEqual('-10')
	})
})
