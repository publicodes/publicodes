import type Engine from 'publicodes'

import { Situation } from 'publicodes'
import { EvaluatedFormElement } from '.'
import type { FormPageElementProp } from './buildFormPage'
import { buildFormPage } from './buildFormPage'
import { computeNextFields } from './computeNextFields'
import { groupByNamespace } from './groupByNamespace'
import { updateSituationWithInputValue } from './updateSituationWithFormValue'

/**
 * Represents the complete state of a multi-page form.
 *
 * This object encapsulates all data needed to track a user's progress through a form,
 * including their answers, the form structure, and navigation state.
 *
 * @template RuleName - The type of rule names used in the form
 *
 * @remarks
 * This state should be stored in your application and made reactive using your
 * framework's state management (React useState, Vue $state, Svelte stores, etc.).
 * All form operations return a new state object that should replace the previous one.
 *
 * @example
 * ```typescript
 * // In React
 * const [formState, setFormState] = useState<FormState<string>>(
 *   FormBuilder.newState()
 * )
 *
 * // In Vue
 * const formState = ref(FormBuilder.newState())
 * ```
 */
export type FormState<RuleName extends string> = {
	situation: Situation<RuleName>
	targets: Array<RuleName>
	pages: PageBuilderOutput<RuleName>
	currentPageIndex: number
	nextPages: PageBuilderOutput<RuleName>
	lastAnswered: RuleName | null
}

/**
 * A function that organizes form fields into logical pages or groups.
 *
 * @template RuleName - The type of rule names used in the form
 * @param fields - Array of field names to organize into pages
 * @returns A two-dimensional array where each inner array represents a page of fields
 *
 * @remarks
 * The default implementation groups fields by their namespace (first part of the dotted name).
 * You can provide a custom implementation to create your own page organization logic.
 *
 * @example
 * ```typescript
 * // Custom page builder that puts each field on its own page
 * const singleFieldPages: PageBuilder<string> = (fields) =>
 *   fields.map(field => [field])
 * ```
 */
export type PageBuilder<RuleName> = (
	fields: Array<RuleName>,
) => PageBuilderOutput<RuleName>

export type PageBuilderOutput<RuleName> = Array<{
	questionsInPage: Array<RuleName>
	title?: string
}>

/**
 * Options for configuring a form.
 *
 * @template RuleName - The type representing the rule names used in the form.
 *
 * @property pageBuilder - An optional function or object responsible for building pages
 * within the form. It allows customization of how the form pages are structured.
 *
 * @property selectTreshold - An optional number that specifies the threshold to make input rather radio options or select.
 */

export type FormOptions<RuleName> = {
	pageBuilder?: PageBuilder<RuleName>
	selectTreshold?: number
}

/**
 * Creates and manages multi-page forms based on Publicodes rules.
 *
 * FormBuilder provides a complete solution for building dynamic, multi-step forms
 * that adapt to user input. It handles:
 *
 * - Form state management
 * - Page navigation and pagination
 * - Field validation and dependencies
 * - Progressive disclosure of relevant fields
 *
 * @template RuleName - The type of rule names used in the form
 *
 * @example
 * ```typescript
 * // Create a form builder
 * const engine = new Engine(rules)
 * const formBuilder = new FormBuilder({ engine })
 *
 * // Initialize form state
 * let state = FormBuilder.newState()
 * state = formBuilder.start(state, 'target . rule')
 *
 * // Handle user input
 * state = formBuilder.handleInputChange(state, 'user . age', 25)
 *
 * // Navigate between pages
 * state = formBuilder.goToNextPage(state)
 * ```
 */
export class FormBuilder<RuleName extends string> {
	private engine: Engine<RuleName>
	private formOptions: {
		pageBuilder: PageBuilder<RuleName>
		selectTreshold?: number
	}

	constructor({
		engine,
		formOptions,
	}: {
		engine: Engine<RuleName>
		formOptions?: FormOptions<RuleName>
	}) {
		this.engine = engine
		this.formOptions = {
			...formOptions,
			...{
				pageBuilder: formOptions?.pageBuilder ?? groupByNamespace,
			},
		}
	}

	/**
	 * Creates a new, empty form state object.
	 *
	 * This static method initializes a blank form state that can be used as the starting
	 * point for a new form. The state includes an optional initial situation (user answers).
	 *
	 * @template RuleName - The type of rule names used in the form
	 * @param situation - Optional initial situation with pre-filled values
	 * @returns A new form state object ready to be used with start()
	 *
	 * @example
	 * ```typescript
	 * // Create an empty form state
	 * const state = FormBuilder.newState()
	 *
	 * // Create a form state with initial values
	 * const stateWithValues = FormBuilder.newState({
	 *   'user . age': 30,
	 *   'user . income': 50000
	 * })
	 * ```
	 */
	static newState<RuleName extends string = string>(
		situation: Situation<RuleName> = {},
	): FormState<RuleName> {
		return {
			situation,
			targets: [],
			pages: [],
			currentPageIndex: -1,
			nextPages: [],
			lastAnswered: null,
		}
	}

	/**
	 * Initializes a form with specified target rules and moves to the first page.
	 *
	 * This method sets up a form by:
	 * 1. Registering the target rules that the form aims to compute
	 * 2. Determining which input fields are needed based on these targets
	 * 3. Organizing these fields into pages using the configured page builder
	 * 4. Moving to the first page of questions
	 *
	 * @param formState - The current form state to initialize
	 * @param targets - One or more target rule names that the form will compute
	 * @returns A new form state initialized with the first page of questions
	 * @throws Error if no targets are provided
	 *
	 * @example
	 * ```typescript
	 * // Initialize a form with a single target
	 * let state = FormBuilder.newState()
	 * state = formBuilder.start(state, 'eligibility . result')
	 *
	 * // Or with multiple targets
	 * state = formBuilder.start(state, 'tax . amount', 'benefits . eligible')
	 * ```
	 */
	start(
		formState: FormState<RuleName>,
		...targets: Array<RuleName>
	): FormState<RuleName> {
		// Todo state with situation and rule, and reconstruct the engine from it
		// This means that setInputValue should return a situation

		if (targets.length === 0) {
			throw new Error('You must provide at least one target')
		}
		this.engine.setSituation(formState.situation)
		const nextFields = computeNextFields(this.engine, { targets, pages: [] })
		formState.nextPages = this.formOptions.pageBuilder(nextFields)
		formState.targets = targets

		return this.goToNextPage(formState)
	}

	/**
	 * Retrieves the current form page with UI properties for rendering.
	 *
	 * This method processes the current page of form fields and enhances them with
	 * UI-specific properties like visibility, focus state, and validation status.
	 * It's typically used when rendering the form in your UI.
	 *
	 * @param formState - The current state of the form
	 * @returns An array of form elements with UI properties and validation state
	 *
	 * @example
	 * ```typescript
	 * // In a React component
	 * const formElements = formBuilder.currentPage(formState)
	 * return (
	 *   <form>
	 *     {formElements.map(element => (
	 *       <FormField
	 *         key={element.id}
	 *         {...element}
	 *         onChange={value => handleChange(element.id, value)}
	 *       />
	 *     ))}
	 *   </form>
	 * )
	 * ```
	 */
	currentPage(
		formState: FormState<RuleName>,
	): Array<EvaluatedFormElement<RuleName> & FormPageElementProp> {
		if (formState.situation !== this.engine.getSituation()) {
			this.engine.setSituation(formState.situation)
		}
		const page = formState.pages[formState.currentPageIndex]
		if (page === undefined) {
			return []
		}

		return buildFormPage(
			formState.pages[formState.currentPageIndex].questionsInPage,
			this.engine,
			formState.targets,
			formState.lastAnswered,
			this.formOptions,
		)
	}

	/**
	 * Wrapper around engine.evaluate that ensures proper reactivity in signal-based systems.
	 *
	 * This method ensures the engine's situation is up-to-date before evaluating a rule,
	 * making it suitable for use in reactive frameworks that track dependencies (like Svelte,
	 * Vue, Solid.js, or other signal-based systems).
	 *
	 * @param formState - The current state of the form
	 * @param ruleName - The name of the rule to evaluate
	 * @returns The evaluation result from the engine
	 *
	 * @example
	 * ```typescript
	 * // In a reactive framework
	 * const result = formBuilder.evaluate(formState, 'total . amount')
	 * // The framework will track this dependency and re-run when formState changes
	 * ```
	 */
	evaluate(formState: FormState<RuleName>, ruleName: RuleName) {
		if (formState.situation !== this.engine.getSituation()) {
			this.engine.setSituation(formState.situation)
		}
		return this.engine.evaluate(ruleName)
	}

	/**
	 * Retrieves pagination information for building navigation controls.
	 *
	 * This method calculates the current page position and total page count,
	 * along with boolean flags that can be used to enable/disable navigation buttons.
	 *
	 * @param formState - The current state of the form
	 * @returns An object containing pagination details:
	 *   - `current` - Current page number (1-based)
	 *   - `pageCount` - Total number of pages (known + upcoming)
	 *   - `hasNextPage` - Whether there is a next page available
	 *   - `hasPreviousPage` - Whether there is a previous page available
	 *
	 * @example
	 * ```typescript
	 * // In a React component
	 * const { current, pageCount, hasNextPage, hasPreviousPage } = formBuilder.pagination(formState)
	 *
	 * return (
	 *   <div className="pagination">
	 *     <span>Page {current} of {pageCount}</span>
	 *     <button disabled={!hasPreviousPage} onClick={handlePrevious}>Previous</button>
	 *     <button disabled={!hasNextPage} onClick={handleNext}>Next</button>
	 *   </div>
	 * )
	 * ```
	 */
	pagination(formState: FormState<RuleName>) {
		const { currentPageIndex, pages, nextPages } = formState
		const pageCount = pages.length + nextPages.length
		return {
			current: currentPageIndex + 1,
			pageCount,
			hasNextPage: currentPageIndex < pageCount - 1,
			hasPreviousPage: currentPageIndex > 0,
		}
	}

	/**
	 * Advances the form to the next page in the sequence.
	 *
	 * This method handles navigation to the next page, including:
	 * - Moving to the next page if one exists in the current pages array
	 * - Loading a new page from the nextPages queue if needed
	 * - Returning the original state if there are no more pages
	 *
	 * @param formState - The current state of the form
	 * @returns A new form state positioned at the next page, or the original state if at the last page
	 *
	 * @example
	 * ```typescript
	 * // Handle "Next" button click
	 * function handleNext() {
	 *   const nextState = formBuilder.goToNextPage(formState)
	 *   setFormState(nextState)
	 *
	 *   // Check if we actually moved to a new page
	 *   if (nextState.currentPageIndex !== formState.currentPageIndex) {
	 *     // Scroll to top or perform other navigation-related actions
	 *     window.scrollTo(0, 0)
	 *   }
	 * }
	 * ```
	 */
	goToNextPage(formState: FormState<RuleName>) {
		const { pages, nextPages } = formState
		if (formState.currentPageIndex < pages.length - 1) {
			formState.currentPageIndex++
			return Object.assign({}, formState)
		}

		if (nextPages.length === 0) {
			return formState
		}

		const [nextPage, ...rest] = nextPages
		formState.pages.push(nextPage)
		formState.nextPages = rest
		formState.currentPageIndex++

		return Object.assign({}, formState, {
			pages: [...formState.pages],
		})
	}

	/**
	 * Navigates to the previous page in the form.
	 *
	 * This method decrements the current page index if possible, allowing users
	 * to go back to review or change their previous answers.
	 *
	 * @param formState - The current state of the form
	 * @returns A new form state positioned at the previous page, or the original state if already at the first page
	 *
	 * @example
	 * ```typescript
	 * // Handle "Previous" button click
	 * function handlePrevious() {
	 *   const prevState = formBuilder.goToPreviousPage(formState)
	 *   setFormState(prevState)
	 *
	 *   // Optionally scroll to top when navigating
	 *   window.scrollTo(0, 0)
	 * }
	 * ```
	 */
	goToPreviousPage(formState: FormState<RuleName>) {
		const { currentPageIndex } = formState
		if (currentPageIndex === 0) {
			return formState
		}
		formState.currentPageIndex--
		return Object.assign({}, formState)
	}

	/**
	 * Updates the form state when a user changes an input value.
	 *
	 * This method:
	 * 1. Records which field was last answered
	 * 2. Updates the engine's situation with the new value
	 * 3. Recalculates which fields are needed next based on the new value
	 * 4. Updates the form state with the new situation and next pages
	 *
	 * @param formState - The current state of the form
	 * @param id - The rule name identifier of the field being updated
	 * @param value - The new value for the field (string, number, boolean, or undefined to clear)
	 * @returns A new form state with updated values and potentially new pages
	 *
	 * @example
	 * ```typescript
	 * // In a React component
	 * function handleChange(id, value) {
	 *   const newState = formBuilder.handleInputChange(formState, id, value)
	 *   setFormState(newState)
	 *
	 *   // The form may have new pages based on this input
	 *   console.log(`Next pages count: ${newState.nextPages.length}`)
	 * }
	 * ```
	 */
	handleInputChange(
		formState: FormState<RuleName>,
		id: RuleName,
		value: string | number | boolean | undefined,
	): FormState<RuleName> {
		formState.lastAnswered = id

		updateSituationWithInputValue(this.engine, id, value)

		formState.nextPages = this.formOptions.pageBuilder(
			computeNextFields(this.engine, formState),
		)
		formState.situation = this.engine.getSituation()
		return Object.assign({}, formState)
	}
}
