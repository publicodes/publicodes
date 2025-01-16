import type Engine from 'publicodes'

import { buildFormPage, FormElementInPage } from './buildFormPage'
import { computeNextFields } from './computeNextFields'
import { groupByNamespace } from './groupByNamespace'
import { updateSituationWithInputValue } from './updateSituationWithFormValue'

/**
 * @typedef {Object} FormState
 * @description The state of a form.
 * This object describes the current state of a form, including the current page, the list of targets, the list of pages and the last answered question.
 * It should be stored in your application, and made reactive (useState, $state, etc.).
 */
export type FormState<Name extends string> = {
	targets: Array<Name>
	pages: Array<Array<Name>>
	currentPageIndex: number
	nextPages: Array<Array<Name>>
	lastAnswered: Name | null
}

/**
 * Dependencies required to for some function used to build a form from a publicodes engine.
 *
 * This type is used to configure the form builder with:
 * - A publicodes engine that handles the business logic and rules
 * - An optional page splitting strategy to organize fields across multiple pages
 *
 * @template Name - String type representing the rule names in the publicodes model
 *
 * @property engine - The publicodes engine instance that contains rules and logic
 * @property pageBuilder - Optional function to group fields into pages
 *                          Takes an array of field names and returns arrays of fields grouped by page
 * 						Defaults to @see {@link groupByNamespace}
 *
 */
export type FormBuilderDependencies<Name extends string> = {
	engine: Engine<Name>
	pageBuilder?: (fields: Array<Name>) => Array<Array<Name>>
}

/**
 * Initializes a form state based on the provided engine and targets.
 *
 * @template Name - The type for target names, must extend string
 * @param  params - The initialization parameters
 * @param  params.engine - The engine instance to compute form fields
 * @param  [params.pageBuilder=groupByNamespace()] - Optional function to split fields into pages, defaults to group by namespace
 * @param  targets - Array of target names to compute fields for
 * @returns The initialized form state with first page computed
 *
 * @remarks
 * The function creates an initial form state by:
 * 1. Computing the next fields based on the engine and targets
 * 2. Splitting these fields into pages using the provided pageBuilder
 * 3. Moving to the first page of questions
 */
export function initFormState<Name extends string>(
	{ engine, pageBuilder = groupByNamespace }: FormBuilderDependencies<Name>,
	...targets: Array<Name>
): FormState<Name> {
	// Todo state with situation and rule, and reconstruct the engine from it
	// This means that setInputValue should return a situation
	const nextFields = computeNextFields(engine, { targets, pages: [] })
	const nextPages = pageBuilder(nextFields)
	const formState: FormState<Name> = goToNextPage({
		targets,
		pages: [],
		currentPageIndex: -1,
		lastAnswered: null,
		nextPages,
	})
	return formState
}

/**
 * Create a UI representation of the current page of the form.
 *
 * This UI representation will be used by the rendering engine of your choice to display the form.
 *
 * It should be called each time the form state is updated, to get the current page of the form.
 *
 * @see {@link FormElementInPage} for the description of the UI representation.
 *
 * @param formState - The current state of the form
 * @param object.engine - The engine instance used to process the form logic and rules
 
 * @returns An array of UI elements representing the current page of the form
 */
export function currentPage<Name extends string>(
	formState: FormState<Name>,
	{ engine }: { engine: Engine<Name> },
): Array<FormElementInPage> {
	const page = formState.pages[formState.currentPageIndex]
	if (page === undefined) {
		return []
	}
	return buildFormPage(
		engine,
		formState.targets,
		formState.pages[formState.currentPageIndex],
		formState.lastAnswered,
	)
}

/**
 * Retrieves pagination information for the current form state.
 *
 * This information can be used to display navigation buttons in the form for instance.
 *
 * @param formState - The current state of the form
 * @returns An object containing pagination details:
 *   - `current` - The current page number (1-based index)
 *   - `pageCount` - Total number of pages
 *   - `hasNextPage` - Boolean indicating if there are more pages after the current one
 *   - `hasPreviousPage` - Boolean indicating if there are pages before the current one
 *
 * @example
 * ```typescript
 * const paginationInfo = pagination(formState);
 * ```
 */
export function pagination<Name extends string>(formState: FormState<Name>) {
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
 * If there are additional pages in the `nextPages` queue, they will be
 * added to the active pages as the user progresses.
 *
 * @param formState - The current state of the form containing page information
 * @returns A new form state with updated page position
 *
 * @example
 * ```ts
 * const updatedState = goToNextPage(currentFormState);
 * // User is now on the next page of the form
 * ```
 */

export function goToNextPage<Name extends string>(formState: FormState<Name>) {
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
 * Navigates to the previous page.
 *
 * @param formState - The current state of the form
 * @returns A new form state with the previous page as the current page. If already on the first page, returns the original state unchanged.
 *
 * @example
 * ```typescript
 * const newState = goToPreviousPage(currentFormState)
 * ```
 */
export function goToPreviousPage<Name extends string>(
	formState: FormState<Name>,
) {
	const { currentPageIndex } = formState
	if (currentPageIndex === 0) {
		return formState
	}
	formState.currentPageIndex--
	return Object.assign({}, formState)
}

/**
 * Updates the form state when a user changes the value of an input field.
 *
 * @param formState - The current state of the form
 * @param id - The identifier of the field being updated (the rule name)
 * @param value - The new value of the field
 * @param dependencies - The dependencies required to update the form state
 * @returns A new form state with updated values, pages, and last answered field
 *
 * @example
 * ```typescript
 * const newState = handleInputChange(currentFormState, 'personne . age', 25, { engine })
 * ```
 */
export function handleInputChange<Name extends string>(
	formState: FormState<Name>,
	id: Name,
	value: string | number | boolean | undefined,
	{ engine, pageBuilder = groupByNamespace }: FormBuilderDependencies<Name>,
): FormState<Name> {
	formState.lastAnswered = id

	updateSituationWithInputValue(engine, id, value)

	formState.nextPages = pageBuilder(computeNextFields(engine, formState))
	return Object.assign({}, formState)
}
