import type * as Ast from '../ast'
import { pageOf } from './pages'
import type { EquationView, LookupCtx, OperandView } from './types'
import { ABSENT } from './value'

/** One result a parameter serves, and its computation — projected by whoever holds it. */
export interface UsageTarget {
	address: string
	name: string
	explanation?: EquationView
}

export interface UsageOptions {
	/** The rows the reader has opened. */
	expanded?: ReadonlySet<string>
	pages?: ReadonlySet<string>
}

/**
 * The results that need this rule, as the lines a computation prints: a name, the value it
 * is worth here, the way to its page, and — opened — the computation that produced it. A
 * line like any other, so the same click says the same thing.
 */
export function projectUsageRows(
	ast: Ast.PublicodeAST,
	targets: readonly UsageTarget[],
	options: UsageOptions = {},
): OperandView[] {
	const ctx: LookupCtx = {
		ast,
		trace: undefined,
		context: undefined,
		contextStackId: '',
		pages: options.pages,
	}
	// une règle que ce modèle ne porte pas n'a pas de ligne à montrer
	return targets
		.filter((target) => ast[target.address] !== undefined)
		.map((target) => {
			const open = options.expanded?.has(target.address) === true
			return {
				id: target.address,
				gutter: '',
				gutterIsMechanism: false,
				key: target.address,
				depth: 0,
				termIsMechanism: false,
				control: 'term',
				label: target.name,
				value: target.explanation?.result ?? ABSENT,
				address: target.address,
				page: pageOf(ctx, target.address),
				description: null,
				parameter: null,
				parameterNote: null,
				detail: open ? (target.explanation ?? null) : null,
				open,
				fold: null,
				inert: false,
				folded: false,
				modifier: false,
				applicability: false,
			}
		})
}
