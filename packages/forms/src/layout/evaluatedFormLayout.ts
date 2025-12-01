import { FormPageElementProp } from '../builder/buildFormPage'
import { EvaluatedFormElement } from '../elements/evaluatedFormElement'
import { GroupLayout, SimpleLayout, TableLayout } from './formLayout'

export type EvaluatedFormLayout<RuleName extends string> =
	| EvaluatedSimpleLayout<RuleName>
	| EvaluatedGroupLayout<RuleName>
	| EvaluatedTableLayout<RuleName>

export type EvaluatedSimpleLayout<RuleName extends string> =
	SimpleLayout<RuleName> & {
		evaluatedElement: EvaluatedFormElement<RuleName> &
			// NOTE: should this be in a separated field?
			FormPageElementProp
	}

export type EvaluatedGroupLayout<RuleName extends string> =
	GroupLayout<RuleName> & {
		evaluatedElements: Array<
			EvaluatedFormElement<RuleName> & FormPageElementProp
		>
	}

export type EvaluatedTableLayout<RuleName extends string> =
	TableLayout<RuleName> & {
		evaluatedRows: Array<
			Array<EvaluatedFormElement<RuleName> & FormPageElementProp>
		>
	}

export function isSimpleLayout<RuleName extends string>(
	layout: EvaluatedFormLayout<RuleName>,
): layout is EvaluatedSimpleLayout<RuleName> {
	return layout.type === 'simple'
}

export function isGroupLayout<RuleName extends string>(
	layout: EvaluatedFormLayout<RuleName>,
): layout is EvaluatedGroupLayout<RuleName> {
	return layout.type === 'group'
}

export function isTableLayout<RuleName extends string>(
	layout: EvaluatedFormLayout<RuleName>,
): layout is EvaluatedTableLayout<RuleName> {
	return layout.type === 'table'
}
