import Engine from 'publicodes'
import { describe, expect, it } from 'vitest'
import { FormBuilder } from './formBuilder'

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
			const formBuilder = new FormBuilder({ engine })
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
					return { questionsInPage: [field] }
				})

			const formBuilder = new FormBuilder<RuleName>({
				engine,
				formOptions: { pageBuilder: customPageBuilder },
			})

			let state = FormBuilder.newState<RuleName>()
			state = formBuilder.start(state, 'eligibility')

			// With our custom page builder, each page should have exactly one field
			expect(state.pages[0].questionsInPage.length).toBe(1)
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
			const formBuilder = new FormBuilder({ engine })
			let state = FormBuilder.newState<RuleName>()
			state = formBuilder.start(state, 'eligibility')

			const currentPageElements = formBuilder.currentPage(state).elements

			expect(currentPageElements.length).toBeGreaterThan(0)
			expect(currentPageElements[0]).toHaveProperty('id')
			expect(currentPageElements[0]).toHaveProperty('label')
			expect(currentPageElements[0]).toHaveProperty('element')
		})
	})

	describe('pagination', () => {
		it('should return correct pagination information', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder({ engine })
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
			const formBuilder = new FormBuilder({ engine })
			let state = FormBuilder.newState<RuleName>()
			state = formBuilder.start(state, 'eligibility')

			const initialPage = state.currentPageIndex

			// Add a second page to nextPages
			state.nextPages = [{ questionsInPage: ['company . name'] }]

			state = formBuilder.goToNextPage(state)

			expect(state.currentPageIndex).toBe(initialPage + 1)
			expect(state.pages.length).toBe(2)
		})

		it('should not navigate past the last page', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder({ engine })
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
			const formBuilder = new FormBuilder({ engine })
			let state = FormBuilder.newState<RuleName>()
			state = formBuilder.start(state, 'eligibility')

			// Add a second page and navigate to it
			state.nextPages = [{ questionsInPage: ['company . name'] }]
			state = formBuilder.goToNextPage(state)

			const currentPage = state.currentPageIndex
			state = formBuilder.goToPreviousPage(state)

			expect(state.currentPageIndex).toBe(currentPage - 1)
		})

		it('should not navigate before the first page', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder({ engine })
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
			const formBuilder = new FormBuilder({ engine })
			let state = FormBuilder.newState<RuleName>()
			state = formBuilder.start(state, 'eligibility')

			state = formBuilder.handleInputChange(state, 'user . age', 25)

			expect(state.situation).toHaveProperty(['user . age'])
			expect(state.lastAnswered).toBe('user . age')
		})

		it('should handle undefined value to clear field', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder({ engine })
			let state = FormBuilder.newState<RuleName>({ 'user . age': 25 })
			state = formBuilder.start(state, 'eligibility')

			state = formBuilder.handleInputChange(state, 'user . age', undefined)

			expect(state.situation).not.toHaveProperty(['user . age'])
		})
	})

	describe('end-to-end form flow', () => {
		it('should guide user through a complete form flow', () => {
			const engine = createTestEngine()
			const formBuilder = new FormBuilder({ engine })

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
})
