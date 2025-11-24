import { FormPageElementProp } from '../builder/buildFormPage'
import { EvaluatedFormElement } from '../elements/evaluatedFormElement'
import { SimpleLayout, TableLayout } from './formLayout'

export type EvaluatedFormLayout<RuleName extends string> =
	| EvaluatedSimpleLayout<RuleName>
	| EvaluatedTableLayout<RuleName>

export type EvaluatedSimpleLayout<RuleName extends string> =
	SimpleLayout<RuleName> &
		EvaluatedFormElement<RuleName> &
		// NOTE: should this be in a separated field?
		FormPageElementProp

export type EvaluatedTableLayout<RuleName extends string> =
	TableLayout<RuleName> & {
		evaluatedRows: Array<
			Array<EvaluatedFormElement<RuleName> & FormPageElementProp>
		>
	}

/**
 * Type guard to check if an evaluated layout is an EvaluatedSimpleLayout.
 */
export function isSimpleLayout<RuleName extends string>(
	layout: EvaluatedFormLayout<RuleName>,
): layout is EvaluatedSimpleLayout<RuleName> {
	return layout.type === 'simple'
}

/**
 * Type guard to check if an evaluated layout is an EvaluatedTableLayout.
 */
export function isTableLayout<RuleName extends string>(
	layout: EvaluatedFormLayout<RuleName>,
): layout is EvaluatedTableLayout<RuleName> {
	return layout.type === 'table'
}
