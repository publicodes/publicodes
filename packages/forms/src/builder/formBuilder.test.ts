import Engine from 'publicodes'
import { describe, expect, it } from 'vitest'
import { FormBuilder } from './formBuilder'
import { simpleLayout, tableLayout } from '../layout/formLayout'
import { EvaluatedSimpleLayout } from '../../dist'

describe('FormBuilder', () => {
	// Define rule names type for type safety
	const rules = {
		user: {},
		'user . name': { question: 'What is your name?' },
		'user . age': { question: 'How old are you?' },
		'user . income': { question: 'What is your income?', unité: '€' },
		eligibility: {
			'toutes ces conditions': ['user . age >= 18', 'user . income > 0'],
			description: 'Eligibility for the program',
		},
		company: {},
		'company . name': { question: 'What is your company name?' },
		'company . size': {
			question: 'How many employees?',
			unité: 'employees',
		},
	}

	type RuleName = keyof typeof rules
	// Helper function to create a simple engine for testing
	function createTestEngine() {
		return new Engine(rules, {
			flag: {
				filterNotApplicablePossibilities: true,
			},
		})
	}

	describe('newState', () => {
		it('should create an empty form state', () => {
			const state = FormBuilder.newState<RuleName>()

			expect(state).toEqual({
				situation: {},
				targets: [],
				pages: [],
				currentPageIndex: -1,
				nextPages: [],
				lastAnswered: null,
			})
		})

		it('should create a form state with initial situation', () => {
			const initialSituation = { 'user . name': 'John' } as const
			const state = FormBuilder.newState<RuleName>(initialSituation)

			expect(state.situation).toEqual(initialSituation)
		})
	})

	describe('start', () => {
		it('should initialize form with target and move to first page', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder<RuleName>({ engine })
			let state = FormBuilder.newState<RuleName>()

			state = formBuilder.start(state, 'eligibility')

			expect(state.targets).toEqual(['eligibility'])
			expect(state.currentPageIndex).toBe(0)
			expect(state.pages.length).toBeGreaterThan(0)
		})

		it('should throw error if no targets are provided', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder({ engine })
			const state = FormBuilder.newState<RuleName>()

			expect(() => formBuilder.start(state)).toThrow(
				'You must provide at least one target',
			)
		})

		it('should use custom pageBuilder if provided', () => {
			const engine = createTestEngine()
			// Custom page builder that puts each field on its own page
			const customPageBuilder = (fields: RuleName[]) =>
				fields.map((field) => {
					return { elements: [simpleLayout(field)] }
				})

			const formBuilder = new FormBuilder<RuleName>({
				engine,
				pageBuilder: customPageBuilder,
			})

			let state = FormBuilder.newState<RuleName>()
			state = formBuilder.start(state, 'eligibility')

			// With our custom page builder, each page should have exactly one field
			expect(state.pages[0].elements.length).toBe(1)
		})
	})

	describe('currentPage', () => {
		it('should return empty array if no current page', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder({ engine })
			const state = FormBuilder.newState<RuleName>()

			const result = formBuilder.currentPage(state)

			expect(result).toEqual({ elements: [] })
		})

		it('should return form elements for current page', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder<RuleName>({ engine })
			let state = FormBuilder.newState<RuleName>()
			state = formBuilder.start(state, 'eligibility')

			const currentPageElements = formBuilder.currentPage(state).elements

			expect(currentPageElements.length).toBeGreaterThan(0)
			const firstElement =
				currentPageElements[0] as EvaluatedSimpleLayout<RuleName>
			expect(firstElement.evaluatedElement).toHaveProperty('id')
			expect(firstElement.evaluatedElement).toHaveProperty('label')
			expect(firstElement.evaluatedElement).toHaveProperty('element')
		})
	})

	describe('pagination', () => {
		it('should return correct pagination information', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder<RuleName>({ engine })
			let state = FormBuilder.newState<RuleName>()
			state = formBuilder.start(state, 'eligibility')

			const pagination = formBuilder.pagination(state)

			expect(pagination).toHaveProperty('current', 1)
			expect(pagination).toHaveProperty('pageCount')
			expect(pagination).toHaveProperty('hasNextPage')
			expect(pagination).toHaveProperty('hasPreviousPage', false)
		})
	})

	describe('navigation', () => {
		it('should navigate to next page', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder<RuleName>({ engine })
			let state = FormBuilder.newState<RuleName>()
			state = formBuilder.start(state, 'eligibility')

			const initialPage = state.currentPageIndex

			// Add a second page to nextPages
			state.nextPages = [{ elements: [simpleLayout('company . name')] }]

			state = formBuilder.goToNextPage(state)

			expect(state.currentPageIndex).toBe(initialPage + 1)
			expect(state.pages.length).toBe(2)
		})

		it('should not navigate past the last page', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder<RuleName>({ engine })
			let state = FormBuilder.newState<RuleName>()
			state = formBuilder.start(state, 'eligibility')

			// Clear nextPages to ensure we're on the last page
			state.nextPages = []

			const initialState = { ...state }
			state = formBuilder.goToNextPage(state)

			// State should remain unchanged
			expect(state.currentPageIndex).toBe(initialState.currentPageIndex)
		})

		it('should navigate to previous page', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder<RuleName>({ engine })
			let state = FormBuilder.newState<RuleName>()
			state = formBuilder.start(state, 'eligibility')

			// Add a second page and navigate to it
			state.nextPages = [{ elements: [simpleLayout('company . name')] }]
			state = formBuilder.goToNextPage(state)

			const currentPage = state.currentPageIndex
			state = formBuilder.goToPreviousPage(state)

			expect(state.currentPageIndex).toBe(currentPage - 1)
		})

		it('should not navigate before the first page', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder<RuleName>({ engine })
			let state = FormBuilder.newState<RuleName>()
			state = formBuilder.start(state, 'eligibility')

			// We're already on the first page
			const initialState = { ...state }
			state = formBuilder.goToPreviousPage(state)

			// State should remain unchanged
			expect(state.currentPageIndex).toBe(initialState.currentPageIndex)
		})
	})

	describe('handleInputChange', () => {
		it('should update situation and recalculate next pages', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder<RuleName>({ engine })
			let state = FormBuilder.newState<RuleName>()
			state = formBuilder.start(state, 'eligibility')

			state = formBuilder.handleInputChange(state, 'user . age', 25)

			expect(state.situation).toHaveProperty(['user . age'])
			expect(state.lastAnswered).toBe('user . age')
		})

		it('should handle undefined value to clear field', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder<RuleName>({ engine })
			let state = FormBuilder.newState<RuleName>({ 'user . age': 25 })
			state = formBuilder.start(state, 'eligibility')

			state = formBuilder.handleInputChange(state, 'user . age', undefined)

			expect(state.situation).not.toHaveProperty(['user . age'])
		})
	})

	describe('end-to-end form flow', () => {
		it('should guide user through a complete form flow', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder<RuleName>({ engine })

			// Start with empty state
			let state = FormBuilder.newState<RuleName>()
			state = formBuilder.start(state, 'eligibility')

			// Fill out the form
			state = formBuilder.handleInputChange(state, 'user . age', 30)
			state = formBuilder.handleInputChange(state, 'user . income', 50000)

			// Check if eligibility rule evaluates correctly
			engine.setSituation(state.situation)
			const result = engine.evaluate('eligibility')

			expect(result.nodeValue).toBe(true)
		})
	})

	describe('TableLayout support', () => {
		it('should handle custom page builder with TableLayout', () => {
			const engine = new Engine(
				{
					a: { question: 'Question A' },
					b: { question: 'Question B' },
					c: { question: 'Question C' },
					d: { question: 'Question D' },
					target: { formule: 'a + b + c + d' },
				},
				{ flag: { filterNotApplicablePossibilities: true } },
			)

			const customPageBuilder = (fields: string[]) => [
				{
					elements: [
						tableLayout(
							'My Table',
							['Col1', 'Col2'],
							[
								[fields[0], fields[1]],
								[fields[2], fields[3]],
							],
						),
					],
				},
			]

			const formBuilder = new FormBuilder({
				engine,
				pageBuilder: customPageBuilder,
			})

			let state = FormBuilder.newState()
			state = formBuilder.start(state, 'target')

			expect(state.pages).toHaveLength(1)
			expect(state.pages[0].elements).toHaveLength(1)
			expect(state.pages[0].elements[0].type).toBe('table')
		})

		it('should render TableLayout in currentPage', () => {
			const rules = {
				a: { question: 'Question A' },
				b: { question: 'Question B' },
				target: { formule: 'a + b' },
			}
			type TableRuleName = keyof typeof rules

			const engine = new Engine(rules, {
				flag: { filterNotApplicablePossibilities: true },
			})

			const customPageBuilder = (_fields: TableRuleName[]) => [
				{
					elements: [
						tableLayout<TableRuleName>(
							'Test Table',
							['Header1', 'Header2'],
							[['a', 'b']],
						),
					],
				},
			]

			const formBuilder = new FormBuilder<TableRuleName>({
				engine,
				pageBuilder: customPageBuilder,
			})

			let state = FormBuilder.newState<TableRuleName>()
			state = formBuilder.start(state, 'target')

			const page = formBuilder.currentPage(state)
			expect(page.elements).toHaveLength(1)

			const tableElement = page.elements[0]
			expect(tableElement.type).toBe('table')
			if (tableElement.type === 'table') {
				expect(tableElement.title).toBe('Test Table')
				expect(tableElement.headers).toEqual(['Header1', 'Header2'])
				expect(tableElement.evaluatedRows).toHaveLength(1)
				expect(tableElement.evaluatedRows[0]).toHaveLength(2)
			}
		})
	})
})
