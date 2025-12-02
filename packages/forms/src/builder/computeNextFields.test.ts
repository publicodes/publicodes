import Engine from 'publicodes'
import { describe, expect, it } from 'vitest'
import { computeNextFields } from './computeNextFields'
import { simpleLayout, tableLayout } from '../layout/formLayout'

describe('computeNextFields', () => {
	it('should return sorted missing variables not in pages', () => {
		const engine = new Engine({
			a: { formule: 'b + c' },
			b: { formule: 'd' },
			c: {},
			d: {},
		})
		const targets = ['a']
		const pages = [{ elements: [simpleLayout('c')] }]
		const result = computeNextFields(engine, { targets, pages })
		expect(result).toEqual(['d'])
	})

	it('should return empty array if no missing variables', () => {
		const engine = new Engine({
			a: '10',
		})
		const targets = ['a']
		const result = computeNextFields(engine, {
			targets,
			pages: [],
		})
		expect(result).toEqual([])
	})

	it('should return missing variable of several targets', () => {
		const engine = new Engine({
			a: { formule: 'b + c' },
			b: { formule: 'd' },
			c: {},
			d: {},
			e: {},
		})
		const targets = ['a', 'e']
		const result = computeNextFields(engine, {
			targets,
			pages: [],
		})
		expect(result).toEqual(['d', 'c', 'e'])
	})

	it('should exclude variables from TableLayout pages', () => {
		const engine = new Engine({
			a: { formule: 'b + c + d' },
			b: {},
			c: {},
			d: {},
		})
		const targets = ['a']
		const pages = [
			{
				elements: [tableLayout('My Table', ['Col1', 'Col2'], [['b', 'c']])],
			},
		]
		const result = computeNextFields(engine, { targets, pages })
		expect(result).toEqual(['d'])
	})

	it('should handle mixed SimpleLayout and TableLayout pages', () => {
		const engine = new Engine({
			a: { formule: 'b + c + d + e' },
			b: {},
			c: {},
			d: {},
			e: {},
		})
		const targets = ['a']
		const pages = [
			{
				elements: [
					simpleLayout('b'),
					tableLayout('Table', ['H1', 'H2'], [['c', 'd']]),
				],
			},
		]
		const result = computeNextFields(engine, { targets, pages })
		expect(result).toEqual(['e'])
	})

	it('should handle TableLayout with multiple rows', () => {
		const engine = new Engine({
			total: { formule: 'a + b + c + d + e' },
			a: {},
			b: {},
			c: {},
			d: {},
			e: {},
		})
		const targets = ['total']
		const pages = [
			{
				elements: [
					tableLayout(
						'Multi-row Table',
						['Col1', 'Col2'],
						[
							['a', 'b'],
							['c', 'd'],
						],
					),
				],
			},
		]
		const result = computeNextFields(engine, { targets, pages })
		expect(result).toEqual(['e'])
	})

	it('should correctly get the next fields inside a table layout', () => {
		const engine = new Engine({
			total: { formule: 'a + b + c + d + e' },
			a: {},
			b: {},
			c: {},
			d: {},
			e: {},
		})
		const targets = ['total']
		const pages = [
			{
				elements: [simpleLayout('a')],
			},
		]
		const result = computeNextFields(engine, { targets, pages })
		expect(result).toEqual(['b', 'c', 'd', 'e'])
	})
})
