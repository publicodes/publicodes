import type Engine from 'publicodes'

import { buildFormPage } from './buildFormPage'
import type { FormPageElementProp } from './buildFormPage'
import { computeNextFields } from './computeNextFields'
import { groupByNamespace } from './groupByNamespace'
import { updateSituationWithInputValue } from './updateSituationWithFormValue'
import { EvaluatedFormElement } from '.'

/**
 * @typedef {Object} FormState
 * @description The state of a form.
 * This object describes the current state of a form, including the current page, the list of targets, the list of pages and the last answered question.
 * It should be stored in your application, and made reactive (useState, $state, etc.).
 */
export type FormState<RuleName extends string> = {
	targets: Array<RuleName>
	pages: Array<Array<RuleName>>
	currentPageIndex: number
	nextPages: Array<Array<RuleName>>
	lastAnswered: RuleName | null
}

/**
 * Function to group fields into pages
 * Takes an array of field names and returns arrays of fields
 */
export type PageBuilder<RuleName> = (
	fields: Array<RuleName>,
) => Array<Array<RuleName>>

/**
 * Initializes a form state based on the provided engine and targets.
 *
 * @template RuleName - The existing rule names
 * @param params
 * @param params.engine - The Publicodes engine instance used to compute form fields
 * @param [params.pageBuilder=groupByNamespace] - Function to split fields into pages
 * @param targets - Array of target rule names to compute fields for
 * @returns A new form state initialized with the first computed page
 *
 * @remarks
 * The function creates an initial form state by:
 * 1. Computing the next fields based on the engine and targets
 * 2. Splitting these fields into pages using the provided pageBuilder
 * 3. Moving to the first page of questions
 *
 *  @example
 * ```typescript
 * const engine = new Engine(rules)
 * const formState = initFormState({ engine }, 'rule1', 'rule2')
 * ```
 */
export function initFormState<RuleName extends string>(
	{
		engine,
		pageBuilder = groupByNamespace,
	}: {
		engine: Engine<RuleName>
		pageBuilder?: PageBuilder<RuleName>
	},
	...targets: Array<RuleName>
): FormState<RuleName> {
	// Todo state with situation and rule, and reconstruct the engine from it
	// This means that setInputValue should return a situation
	const nextFields = computeNextFields(engine, { targets, pages: [] })
	const nextPages = pageBuilder(nextFields)
	const formState: FormState<RuleName> = goToNextPage({
		targets,
		pages: [],
		currentPageIndex: -1,
		lastAnswered: null,
		nextPages,
	})
	return formState
}

/**
 * Creates a UI representation of the current form page.
 *
 * @template RuleName - The existing rule names
 * @param params
 * @param params.formState - The current state of the form
 * @param params.engine - The Publicodes engine instance
 * @returns An array of form elements with their UI properties and validation state
 *
 * @example
 * ```typescript
 * const pageElements = currentPage({ formState, engine })
 * // Returns array of FormElementInPage to be rendered
 * ```
 */
export function currentPage<RuleName extends string>({
	formState,
	engine,
}: {
	formState: FormState<RuleName>
	engine: Engine<RuleName>
}): Array<EvaluatedFormElement & FormPageElementProp> {
	const page = formState.pages[formState.currentPageIndex]
	if (page === undefined) {
		return []
	}
	return buildFormPage(
		formState.pages[formState.currentPageIndex],
		engine,
		formState.targets,
		formState.lastAnswered,
	)
}

/**
 * Retrieves pagination information for the current form state.
 *
 * @template RuleName - The existing rule names
 * @param formState - The current state of the form
 * @returns An object containing pagination details:
 *   - `current` - Current page number (1-based)
 *   - `pageCount` - Total number of pages
 *   - `hasNextPage` - Whether there is a next page
 *   - `hasPreviousPage` - Whether there is a previous page
 *
 * @example
 * ```typescript
 * const { current, pageCount, hasNextPage } = pagination(formState)
 * if (hasNextPage) {
 *   // Show next page button
 * }
 * ```
 */
export function pagination<RuleName extends string>(
	formState: FormState<RuleName>,
) {
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
 * @template RuleName - The existing rule names
 * @param formState - The current state of the form
 * @returns A new form state positioned at the next page. If no next page exists,
 *          returns the original state unchanged
 *
 * @example
 * ```typescript
 * const nextState = goToNextPage(formState)
 * if (nextState === formState) {
 *   // We were already at the last page
 * }
 * ```
 */
export function goToNextPage<RuleName extends string>(
	formState: FormState<RuleName>,
) {
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
 * @template RuleName - The existing rule names
 * @param formState - The current state of the form
 * @returns A new form state positioned at the previous page. If already on the first page,
 *          returns the original state unchanged
 *
 * @example
 * ```typescript
 * const prevState = goToPreviousPage(formState)
 * if (prevState === formState) {
 *   // We were already at the first page
 * }
 * ```
 */
export function goToPreviousPage<RuleName extends string>(
	formState: FormState<RuleName>,
) {
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
 * @template RuleName - The existing rule names
 * @param params
 * @param params.id - The rule name identifier of the field being updated
 * @param params.value - The new value for the field
 * @param params.formState - The current state of the form
 * @param params.engine - The Publicodes engine instance
 * @param [params.pageBuilder=groupByNamespace] - Function to split fields into pages
 * @returns A new form state with updated values and potentially new pages
 *
 * @example
 * ```typescript
 * const newState = handleInputChange({
 *   id: 'usager . age',
 *   value: 25,
 *   formState,
 *   engine
 * })
 * // The engine's situation is updated and new pages may be computed
 * ```
 */
export function handleInputChange<RuleName extends string>({
	id,
	value,
	formState,
	engine,
	pageBuilder = groupByNamespace,
}: {
	engine: Engine<RuleName>
	pageBuilder?: PageBuilder<RuleName>
	id: RuleName
	value: string | number | boolean | undefined
	formState: FormState<RuleName>
}): FormState<RuleName> {
	formState.lastAnswered = id

	updateSituationWithInputValue(engine, id, value)

	formState.nextPages = pageBuilder(computeNextFields(engine, formState))
	return Object.assign({}, formState)
}
