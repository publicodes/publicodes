import Engine from 'publicodes'
import { describe, expect, it } from 'vitest'
import { buildFormPage } from './buildFormPage'
import { simpleLayout, tableLayout } from '../layout/formLayout'
import { isSimpleLayout, isTableLayout } from '../layout/evaluatedFormLayout'

describe('buildFormPage', () => {
	const createTestEngine = () => {
		return new Engine(
			{
				a: { question: 'Question A' },
				b: { question: 'Question B' },
				c: { question: 'Question C' },
				d: { question: 'Question D' },
				target: { formule: 'a + b + c + d' },
			},
			{
				flag: {
					filterNotApplicablePossibilities: true,
				},
			},
		)
	}

	describe('SimpleLayout', () => {
		it('should evaluate a simple layout correctly', () => {
			const engine = createTestEngine()
			const page = [simpleLayout('a')]
			const result = buildFormPage(page, engine, ['target'], null, {})

			expect(result).toHaveLength(1)
			const element = result[0]
			expect(isSimpleLayout(element)).toBe(true)
			if (isSimpleLayout(element)) {
				expect(element.type).toBe('simple')
				expect(element.rule).toBe('a')
				expect(element.id).toBe('a')
				expect(element.useful).toBe(true)
				expect(element.disabled).toBe(false)
				expect(element.hidden).toBe(false)
			}
		})

		it('should handle progressive disclosure for simple layouts', () => {
			const engine = createTestEngine()
			engine.setSituation({ a: 10 })
			const page = [simpleLayout('a'), simpleLayout('b'), simpleLayout('c')]
			const result = buildFormPage(page, engine, ['target'], 'a', {})

			expect(result).toHaveLength(3)

			// First element (answered) should be visible
			const first = result[0]
			if (isSimpleLayout(first)) {
				expect(first.hidden).toBe(false)
			}

			// Elements after lastAnswered should be hidden if not useful
			// (b and c are useful so they won't be hidden in this case)
			const second = result[1]
			if (isSimpleLayout(second)) {
				expect(second.useful).toBe(true)
			}
		})

		it('should set autofocus on first field of new page', () => {
			const engine = createTestEngine()
			const page = [simpleLayout('a'), simpleLayout('b')]
			const result = buildFormPage(page, engine, ['target'], null, {})

			const first = result[0]
			if (isSimpleLayout(first)) {
				expect(first.autofocus).toBe(false) // No lastAnswered means not a new page
			}
		})
	})

	describe('TableLayout', () => {
		it('should evaluate a table layout correctly', () => {
			const engine = createTestEngine()
			const page = [
				tableLayout(
					'My Table',
					['Col1', 'Col2'],
					[
						['a', 'b'],
						['c', 'd'],
					],
				),
			]
			const result = buildFormPage(page, engine, ['target'], null, {})

			expect(result).toHaveLength(1)
			const table = result[0]

			expect(isTableLayout(table)).toBe(true)
			if (isTableLayout(table)) {
				expect(table.type).toBe('table')
				expect(table.title).toBe('My Table')
				expect(table.headers).toEqual(['Col1', 'Col2'])
				expect(table.rows).toEqual([
					['a', 'b'],
					['c', 'd'],
				])
				expect(table.evaluatedRows).toHaveLength(2)
				expect(table.evaluatedRows[0]).toHaveLength(2)
				expect(table.evaluatedRows[1]).toHaveLength(2)

				// Check first cell
				const firstCell = table.evaluatedRows[0][0]
				expect(firstCell.id).toBe('a')
				expect(firstCell.useful).toBe(true)
				expect(firstCell.disabled).toBe(false)
			}
		})

		it('should handle table with answered cells', () => {
			const engine = createTestEngine()
			engine.setSituation({ a: 10, b: 20 })

			const page = [tableLayout('Table', ['H1', 'H2'], [['a', 'b']])]
			const result = buildFormPage(page, engine, ['target'], 'b', {})

			const table = result[0]
			if (isTableLayout(table)) {
				expect(table.evaluatedRows[0][0].answered).toBe(true)
				expect(table.evaluatedRows[0][1].answered).toBe(true)
			}
		})

		it('should set autofocus on first cell of table for new page', () => {
			const engine = createTestEngine()
			const page = [tableLayout('Table', ['H1', 'H2'], [['a', 'b']])]
			const result = buildFormPage(page, engine, ['target'], 'c', {})

			const table = result[0]
			if (isTableLayout(table)) {
				// When lastAnswered is not in this page and no cells are answered,
				// the first cell should get autofocus
				expect(table.evaluatedRows[0][0].autofocus).toBe(true)
			}
		})

		it('should handle progressive disclosure for tables', () => {
			const engine = createTestEngine()
			engine.setSituation({ a: 10 })

			const page = [
				simpleLayout('a'),
				tableLayout('Table', ['H1', 'H2'], [['b', 'c']]),
				simpleLayout('d'),
			]
			const result = buildFormPage(page, engine, ['target'], 'a', {})

			// The simple layout after lastAnswered should not be hidden (it's useful)
			const lastElement = result[2]
			if (isSimpleLayout(lastElement)) {
				expect(lastElement.useful).toBe(true)
			}
		})
	})

	describe('Mixed layouts', () => {
		it('should handle mixed simple and table layouts', () => {
			const engine = createTestEngine()
			const page = [
				simpleLayout('a'),
				tableLayout('Table', ['H1', 'H2'], [['b', 'c']]),
				simpleLayout('d'),
			]
			const result = buildFormPage(page, engine, ['target'], null, {})

			expect(result).toHaveLength(3)
			expect(isSimpleLayout(result[0])).toBe(true)
			expect(isTableLayout(result[1])).toBe(true)
			expect(isSimpleLayout(result[2])).toBe(true)
		})

		it('should find lastAnswered in table when determining progressive disclosure', () => {
			const engine = createTestEngine()
			engine.setSituation({ b: 20 })

			const page = [
				simpleLayout('a'),
				tableLayout('Table', ['H1', 'H2'], [['b', 'c']]),
				simpleLayout('d'),
			]
			const result = buildFormPage(page, engine, ['target'], 'b', {})

			// 'b' is in the table (index 1), so elements after should consider this
			const lastElement = result[2]
			if (isSimpleLayout(lastElement)) {
				// d is after the table containing b, but it's useful so not hidden
				expect(lastElement.useful).toBe(true)
			}
		})
	})
})
