import type * as Ast from '../ast'
import type { ContextStackId, Trace, TraceValue } from '../trace'
import { projectContext } from './context'
import { projectUsedBy } from './graph'
import { displayName } from './names'
import { projectExpression, projectNode } from './nodes'
import type { Absence, Ctx, RuleView } from './types'
import { formatSupplied, unitOf } from './value'

export interface ProjectionOptions {
	trace?: Trace
	contextStackId?: ContextStackId
	context?: Record<string, TraceValue>
	/**
	 * The parameters this evaluation used, from the compiled evaluation's
	 * `needed` list. A parameter the rule could reach but the calculation never
	 * consulted is not listed.
	 */
	usedParameters?: readonly string[]
	/** The parameters the evaluation found no value for, from its own `missing`. */
	missing?: readonly string[]
	/**
	 * The rule that was evaluated. `usedParameters` and `missing` describe that
	 * evaluation, so they only apply to that rule: another rule's page falls
	 * back to its own declared parameters.
	 */
	evaluatedRule?: string
}

/**
 * Projects one rule into the view model its page renders.
 */
export function projectRule(
	ast: Ast.PublicodeAST,
	ruleName: string,
	options: ProjectionOptions = {},
): RuleView {
	const rule = ast[ruleName]
	const ctx: Ctx = {
		ast,
		trace: options.trace,
		contextStackId: options.contextStackId ?? '',
		context: options.context,
		projectNode,
		projectExpression,
	}
	const projected = projectNode(
		{
			value_mechanism: rule.value_mechanism,
			chained_mechanisms: rule.chained_mechanisms,
		},
		ctx,
	)
	// A parameter's value comes from the context, not from an evaluation: the
	// runtime returns it without recording a trace entry for the rule itself.
	const supplied = ctx.context?.[ruleName]
	let equation = projected
	if (
		equation &&
		equation.result.state === 'absent' &&
		supplied !== undefined
	) {
		equation = {
			...equation,
			result: {
				state: 'value',
				value: supplied,
				text: formatSupplied(supplied, rule.value_mechanism.type, unitOf(rule)),
			},
		}
	}

	const absence: Absence | null =
		rule.value_mechanism.kind === 'not_defined' ? 'no_computation'
		: equation?.result.state === 'not_applicable' ? 'not_applicable'
		: equation?.result.state === 'not_defined' ? 'not_defined'
		: null

	return {
		name: displayName(ast, ruleName),
		address: ruleName,
		description: rule.description ?? null,
		note: rule.note ?? null,
		isPublic: rule.public ?? false,
		type: rule.type,
		unit: unitOf(rule) ?? null,
		position: { file: rule.position.file, line: rule.position.start.line },
		equation,
		absence,
		context: projectContext(
			rule,
			ctx,
			options.evaluatedRule === undefined || options.evaluatedRule === ruleName ?
				options.usedParameters
			:	undefined,
			options.evaluatedRule === undefined || options.evaluatedRule === ruleName ?
				options.missing
			:	undefined,
		),
		usedBy: projectUsedBy(rule),
		fill: options.trace ? 'evaluated' : 'generic',
	}
}

export { displayName, leafName } from './names'
export { projectExpression, projectNode } from './nodes'
export type {
	Absence,
	ContextEntryView,
	Ctx,
	EquationView,
	FillLevel,
	ModifierView,
	OperandView,
	RuleView,
	ValueView,
} from './types'
