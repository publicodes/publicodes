import type Engine from 'publicodes'

import { buildFormPage, FormPageElement } from './formPage'
import { computeNextFields, countNextPages, createNextPage } from './nextPage'
import type { PageOptions } from './nextPage'
import { updateSituationWithFormValue } from './updateSituationWithFormValue'

/**
 * @module formState
 *
 * This module is the main entry point for creating automatic forms with Publicodes. It provides functions to create, update and navigate a form state.
 *
 * A form is a set of questions that are automatically generated from a set of targets (the result to compute). Thoses questions are paginated and the user can navigate between them.
 *
 * The form state includes the current page, the list of targets, the list of pages and the last answered question, and can be serialized. The current situation is stored in the engine.
 *
 * Theses function are designed to be used indifferently with any state management system (React's useState, Redux, Svelte Rune, etc.).
 *
 * See the [guides](https://publi.codes/docs/guides/formulaires) for more information.
 */

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
	nextFields: Array<Name>
	lastAnswered: Name | null
}

/**
 * Create a form state from an engine and a list of targets.
 *
 * The initial state is a blank form (with no pages). To start the form, you should call the {@link nextPage} function to create the first page.
 *
 * @param engine
 * @param targets
 * @returns
 */
export function initFormState<Name extends string>(
	engine: Engine<Name>,
	...targets: Array<string>
) {
	// Todo state with situation and rule, and reconstruct the engine from it
	// This means that setInputValue should return a situation
	const formState: FormState<string> = {
		targets,
		pages: [],
		currentPageIndex: -1,
		lastAnswered: null,
		nextFields: computeNextFields(engine, targets),
	}
	return formState
}

/**
 * Create a UI representation of the current page of the form.
 *
 * This UI representation will be used by the rendering engine of your choice to display the form.
 *
 * It should be called each time the form state is updated, to get the current page of the form.
 *
 * @see {@link FormPageElement} for the description of the UI representation.
 *
 * @param formState
 * @param engine
 * @returns
 */
export function currentPage<Name extends string>(
	formState: FormState<Name>,
	engine: Engine<Name>,
): Array<FormPageElement> {
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
 * Get pagination information for the current form state.
 *
 * This information can be used to display navigation buttons in the form.
 *
 * @param formState
 * @returns {{
 *  		current: number,
 * }
 * }
 *
 */
export function pagination<Name extends string>(formState: FormState<Name>) {
	const { currentPageIndex, pages } = formState
	const pageCount = pages.length + countNextPages(formState.nextFields)
	return {
		current: currentPageIndex + 1,
		pageCount,
		hasNextPage: currentPageIndex < pageCount - 1,
		hasPreviousPage: currentPageIndex > 0,
	}
}

export function goToNextPage<Name extends string>(
	formState: FormState<Name>,
	pageOptions: PageOptions,
) {
	const { pages, nextFields } = formState
	if (formState.currentPageIndex < pages.length - 1) {
		formState.currentPageIndex++
		return Object.assign({}, formState)
	}

	if (nextFields.length === 0) {
		return formState
	}

	const nextPage = createNextPage(nextFields, pageOptions)
	formState.pages.push(nextPage)
	formState.nextFields = nextFields.filter(
		(dottedName) => !nextPage.includes(dottedName),
	)
	formState.currentPageIndex++

	return Object.assign({}, formState, {
		pages: [...formState.pages],
	})
}

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

export function handleInputChange<Name extends string>(
	formState: FormState<Name>,
	engine: Engine<Name>,
	dottedName: Name,
	value: string | number | boolean | undefined,
): FormState<Name> {
	formState.lastAnswered = dottedName
	updateSituationWithFormValue(engine, dottedName, value)
	formState.nextFields = computeNextFields(
		engine,
		formState.targets,
		formState.pages.flat(),
	)
	formState = Object.assign({}, formState)
	return formState
}
